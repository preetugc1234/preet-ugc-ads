"""
Razorpay payment integration routes.
Handles order creation, payment verification, and webhook processing.
"""

import os
import hmac
import hashlib
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
# import razorpay
try:
    import razorpay
except ImportError:
    print("Razorpay not available, using mock")
    razorpay = None

from ..auth import require_auth, AuthUser
from ..database import get_db, update_user_credits, CreditLedgerModel
from bson import ObjectId

logger = logging.getLogger(__name__)

# Razorpay Configuration (Demo credentials)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_K7hC9tDbP2x1rh")  # Demo key
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "zWpT8FiK9dPmHqzKq2Z0XnC5")  # Demo secret
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "webhook_secret_demo")

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

router = APIRouter(prefix="/api/razorpay", tags=["payments"])

# Pydantic Models
class CreateOrderRequest(BaseModel):
    credits: int
    amount: float
    currency: str = "INR"

class OrderResponse(BaseModel):
    success: bool
    order_id: str
    amount: int  # Amount in smallest currency unit (paise for INR)
    currency: str
    razorpay_key: str
    message: str

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

class PaymentVerificationResponse(BaseModel):
    success: bool
    credits_added: int
    new_balance: int
    message: str

class SubscriptionRequest(BaseModel):
    plan_id: str

class SubscriptionResponse(BaseModel):
    success: bool
    subscription_id: str
    razorpay_key: str
    plan_id: str
    message: str

# Helper Functions
def calculate_credits_from_amount(amount: float) -> int:
    """Calculate credits from amount using the 0.0275 USD per credit rule."""
    # Convert INR to USD (approximate rate: 1 USD = 83 INR)
    amount_usd = amount / 83.0
    raw_credits = amount_usd / 0.0275
    # Round using the specified rounding rule
    fractional_part = raw_credits % 1
    return int(raw_credits) if fractional_part < 0.5 else int(raw_credits) + 1

def calculate_amount_from_credits(credits: int) -> float:
    """Calculate INR amount from credits."""
    amount_usd = credits * 0.0275
    amount_inr = amount_usd * 83.0  # Convert to INR
    return round(amount_inr, 2)

def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature."""
    try:
        # Create the data string as per Razorpay documentation
        data = f"{order_id}|{payment_id}"

        # Generate expected signature
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # Compare signatures
        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        logger.error(f"Error verifying Razorpay signature: {e}")
        return False

# Routes
@router.post("/create-order", response_model=OrderResponse)
async def create_razorpay_order(
    request: CreateOrderRequest,
    current_user: AuthUser = Depends(require_auth)
):
    """Create a Razorpay order for credit purchase."""
    try:
        # Validate request
        if request.credits < 100:
            raise HTTPException(
                status_code=400,
                detail="Minimum purchase is 100 credits"
            )

        if request.credits > 90000:
            raise HTTPException(
                status_code=400,
                detail="Maximum purchase is 90,000 credits per transaction"
            )

        # Calculate amount in paise (smallest currency unit for INR)
        amount_inr = calculate_amount_from_credits(request.credits)
        amount_paise = int(amount_inr * 100)

        # Create Razorpay order
        order_data = {
            "amount": amount_paise,
            "currency": request.currency,
            "receipt": f"order_{current_user.id}_{int(datetime.now().timestamp())}",
            "notes": {
                "user_id": str(current_user.id),
                "credits": request.credits,
                "user_email": current_user.email
            }
        }

        # For demo purposes, we'll simulate the order creation
        if RAZORPAY_KEY_ID.startswith("rzp_test"):
            # Demo mode - create a mock order
            order_id = f"order_demo_{int(datetime.now().timestamp())}"
            logger.info(f"Demo order created: {order_id} for {request.credits} credits")
        else:
            # Real Razorpay integration
            order = razorpay_client.order.create(order_data)
            order_id = order["id"]
            logger.info(f"Razorpay order created: {order_id} for {request.credits} credits")

        return OrderResponse(
            success=True,
            order_id=order_id,
            amount=amount_paise,
            currency=request.currency,
            razorpay_key=RAZORPAY_KEY_ID,
            message=f"Order created for {request.credits} credits"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create payment order"
        )

@router.post("/verify-payment", response_model=PaymentVerificationResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: AuthUser = Depends(require_auth)
):
    """Verify Razorpay payment and add credits to user account."""
    try:
        # For demo purposes, always verify successfully
        if RAZORPAY_KEY_ID.startswith("rzp_test"):
            logger.info(f"Demo payment verification for order: {request.razorpay_order_id}")

            # Extract credits from order (demo simulation)
            # In real implementation, you'd fetch the order from Razorpay
            credits_to_add = 1000  # Demo: add 1000 credits

        else:
            # Verify payment signature
            if not verify_razorpay_signature(
                request.razorpay_order_id,
                request.razorpay_payment_id,
                request.razorpay_signature
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid payment signature"
                )

            # Fetch order details from Razorpay
            order = razorpay_client.order.fetch(request.razorpay_order_id)
            credits_to_add = int(order["notes"]["credits"])

        # Add credits to user account atomically
        success = update_user_credits(current_user.id, credits_to_add)
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to add credits to account"
            )

        # Get updated user balance
        db = get_db()
        updated_user = db.users.find_one({"_id": current_user.id})
        new_balance = updated_user["credits"]

        # Create ledger entry
        ledger_entry = CreditLedgerModel.create_ledger_entry(
            user_id=current_user.id,
            change=credits_to_add,
            balance_after=new_balance,
            reason="purchase",
            razorpay_order_id=request.razorpay_order_id
        )
        db.credit_ledger.insert_one(ledger_entry)

        logger.info(f"Payment verified and {credits_to_add} credits added to user {current_user.email}")

        return PaymentVerificationResponse(
            success=True,
            credits_added=credits_to_add,
            new_balance=new_balance,
            message=f"Payment verified! {credits_to_add} credits added to your account."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to verify payment"
        )

@router.post("/create-subscription", response_model=SubscriptionResponse)
async def create_subscription(
    request: SubscriptionRequest,
    current_user: AuthUser = Depends(require_auth)
):
    """Create a Razorpay subscription for recurring plans."""
    try:
        # For demo purposes, create a mock subscription
        if RAZORPAY_KEY_ID.startswith("rzp_test"):
            subscription_id = f"sub_demo_{int(datetime.now().timestamp())}"
            logger.info(f"Demo subscription created: {subscription_id} for plan {request.plan_id}")
        else:
            # Real Razorpay subscription creation
            subscription_data = {
                "plan_id": request.plan_id,
                "customer_notify": 1,
                "total_count": 12,  # 12 months
                "notes": {
                    "user_id": str(current_user.id),
                    "user_email": current_user.email
                }
            }
            subscription = razorpay_client.subscription.create(subscription_data)
            subscription_id = subscription["id"]

        return SubscriptionResponse(
            success=True,
            subscription_id=subscription_id,
            razorpay_key=RAZORPAY_KEY_ID,
            plan_id=request.plan_id,
            message="Subscription created successfully"
        )

    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create subscription"
        )

@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhooks for automated payment processing."""
    try:
        # Get request body and headers
        body = await request.body()
        signature = request.headers.get("X-Razorpay-Signature")

        if not signature:
            raise HTTPException(status_code=400, detail="Missing signature")

        # For demo purposes, always process webhooks successfully
        if RAZORPAY_KEY_ID.startswith("rzp_test"):
            logger.info("Demo webhook received and processed")
            return {"status": "success", "message": "Demo webhook processed"}

        # Verify webhook signature
        expected_signature = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode('utf-8'),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

        # Parse webhook data
        webhook_data = json.loads(body.decode('utf-8'))
        event = webhook_data.get("event")
        payload = webhook_data.get("payload", {})

        # Handle different webhook events
        if event == "payment.captured":
            await handle_payment_captured(payload)
        elif event == "subscription.charged":
            await handle_subscription_charged(payload)
        elif event == "order.paid":
            await handle_order_paid(payload)

        logger.info(f"Webhook processed successfully: {event}")
        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def handle_payment_captured(payload: Dict[str, Any]):
    """Handle payment.captured webhook event."""
    try:
        payment = payload.get("payment", {})
        order_id = payment.get("order_id")

        if not order_id:
            logger.warning("Payment captured webhook missing order_id")
            return

        # Additional processing for captured payments
        logger.info(f"Payment captured for order: {order_id}")

    except Exception as e:
        logger.error(f"Error handling payment captured: {e}")

async def handle_subscription_charged(payload: Dict[str, Any]):
    """Handle subscription.charged webhook event."""
    try:
        subscription = payload.get("subscription", {})
        payment = payload.get("payment", {})

        # Process subscription renewal
        logger.info(f"Subscription charged: {subscription.get('id')}")

    except Exception as e:
        logger.error(f"Error handling subscription charged: {e}")

async def handle_order_paid(payload: Dict[str, Any]):
    """Handle order.paid webhook event."""
    try:
        order = payload.get("order", {})

        # Process order payment
        logger.info(f"Order paid: {order.get('id')}")

    except Exception as e:
        logger.error(f"Error handling order paid: {e}")

@router.get("/history")
async def get_payment_history(
    current_user: AuthUser = Depends(require_auth)
):
    """Get user's payment/credit transaction history."""
    try:
        db = get_db()

        # Get credit transactions
        transactions = list(db.credit_ledger.find(
            {"userId": current_user.id}
        ).sort("createdAt", -1).limit(20))

        # Convert ObjectIds to strings
        for transaction in transactions:
            transaction["_id"] = str(transaction["_id"])
            transaction["userId"] = str(transaction["userId"])
            if transaction.get("jobId"):
                transaction["jobId"] = str(transaction["jobId"])
            if transaction.get("adminId"):
                transaction["adminId"] = str(transaction["adminId"])

        return {
            "success": True,
            "transactions": transactions,
            "message": f"Retrieved {len(transactions)} transactions"
        }

    except Exception as e:
        logger.error(f"Error getting payment history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve payment history"
        )

# Utility endpoints
@router.get("/plans")
async def get_available_plans():
    """Get available subscription plans."""
    return {
        "success": True,
        "plans": {
            "free": {
                "name": "Free",
                "credits_per_month": 150,
                "price_monthly": 0,
                "price_yearly": 0,
                "features": ["150 credits/month", "Basic support", "Community access"]
            },
            "pro_1000": {
                "name": "Pro 1K",
                "credits_per_month": 1000,
                "price_monthly": 27.5,
                "price_yearly": 275,
                "features": ["1,000 credits/month", "Priority support", "Advanced features"]
            },
            "pro_5000": {
                "name": "Pro 5K",
                "credits_per_month": 5000,
                "price_monthly": 137.5,
                "price_yearly": 1375,
                "features": ["5,000 credits/month", "Priority support", "Advanced features"]
            }
        },
        "one_time_purchase": {
            "min_credits": 100,
            "max_credits": 90000,
            "price_per_credit": 0.0275,
            "currency": "USD"
        }
    }