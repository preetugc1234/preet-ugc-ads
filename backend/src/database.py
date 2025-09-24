"""
Database configuration and models for UGC AI SaaS application.
MongoDB Atlas integration with pymongo.
"""

import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
from pymongo.collection import Collection
from bson import ObjectId
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection string - use environment variable or fallback
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://Preet1234:Preet1246@ugc.qqqbt5d.mongodb.net/?retryWrites=true&w=majority&appName=UGC")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ugc_ai_saas")

class DatabaseManager:
    """Centralized database manager for MongoDB operations."""

    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.database: Optional[Database] = None

    def connect(self):
        """Establish connection to MongoDB Atlas."""
        try:
            self.client = MongoClient(
                MONGODB_URI,
                maxPoolSize=50,
                wtimeoutMS=2500,
                serverSelectionTimeoutMS=5000
            )

            # Test the connection
            self.client.admin.command('ping')
            self.database = self.client[DATABASE_NAME]
            logger.info("Successfully connected to MongoDB Atlas with environment variables")

            # Create collections and indexes
            self.setup_collections()

        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    def get_database(self) -> Database:
        """Get database instance."""
        if self.database is None:
            self.connect()
        return self.database

    def setup_collections(self):
        """Create collections and set up indexes."""
        if self.database is None:
            return

        # Users collection
        users_collection = self.database.users
        users_collection.create_index([("authProviderId", ASCENDING)], unique=True)
        users_collection.create_index([("email", ASCENDING)], unique=True)
        users_collection.create_index([("createdAt", DESCENDING)])

        # Jobs collection
        jobs_collection = self.database.jobs
        jobs_collection.create_index([("clientJobId", ASCENDING)], unique=True)
        jobs_collection.create_index([("userId", ASCENDING)])
        jobs_collection.create_index([("status", ASCENDING)])
        jobs_collection.create_index([("createdAt", DESCENDING)])
        jobs_collection.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])

        # Generations collection (history)
        generations_collection = self.database.generations
        generations_collection.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])
        generations_collection.create_index([("jobId", ASCENDING)])
        generations_collection.create_index([("createdAt", DESCENDING)])

        # Credit ledger collection
        credit_ledger_collection = self.database.credit_ledger
        credit_ledger_collection.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])
        credit_ledger_collection.create_index([("razorpayOrderId", ASCENDING)], sparse=True)
        credit_ledger_collection.create_index([("jobId", ASCENDING)], sparse=True)
        credit_ledger_collection.create_index([("createdAt", DESCENDING)])

        # Deletion queue collection
        deletion_queue_collection = self.database.deletion_queue
        deletion_queue_collection.create_index([("nextTryAt", ASCENDING)])
        deletion_queue_collection.create_index([("createdAt", DESCENDING)])

        # TTS results collection (for job tracking)
        tts_results_collection = self.database.tts_results
        tts_results_collection.create_index([("job_id", ASCENDING)], unique=True)
        tts_results_collection.create_index([("user_id", ASCENDING)])
        tts_results_collection.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)  # TTL index
        tts_results_collection.create_index([("created_at", DESCENDING)])

        logger.info("Collections and indexes created successfully")

# Global database manager instance
db_manager = DatabaseManager()

def get_db() -> Database:
    """Get database instance for use in routes."""
    return db_manager.get_database()

# Collection schemas and helper functions
class UserModel:
    """User document schema and operations."""

    @staticmethod
    def create_user(
        auth_provider_id: str,
        email: str,
        name: str,
        plan: str = "free",
        credits: int = 150
    ) -> Dict[str, Any]:
        """Create a new user document."""
        return {
            "authProviderId": auth_provider_id,
            "email": email,
            "name": name,
            "isAdmin": False,
            "plan": plan,
            "credits": credits,
            "razorpayCustomerId": None,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }

class JobModel:
    """Job document schema and operations."""

    @staticmethod
    def create_job(
        client_job_id: str,
        user_id: ObjectId,
        module: str,
        params: Dict[str, Any],
        used_credits: int
    ) -> Dict[str, Any]:
        """Create a new job document."""
        return {
            "clientJobId": client_job_id,
            "userId": user_id,
            "module": module,
            "params": params,
            "usedCredits": used_credits,
            "status": "queued",
            "previewUrl": None,
            "finalUrls": [],
            "workerMeta": {},
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }

class GenerationModel:
    """Generation document schema and operations."""

    @staticmethod
    def create_generation(
        user_id: ObjectId,
        job_id: ObjectId,
        generation_type: str,
        preview_url: str,
        final_urls: List[str],
        size_bytes: int = 0
    ) -> Dict[str, Any]:
        """Create a new generation document."""
        return {
            "userId": user_id,
            "jobId": job_id,
            "type": generation_type,
            "previewUrl": preview_url,
            "finalUrls": final_urls,
            "sizeBytes": size_bytes,
            "createdAt": datetime.now(timezone.utc)
        }

class CreditLedgerModel:
    """Credit ledger document schema and operations."""

    @staticmethod
    def create_ledger_entry(
        user_id: ObjectId,
        change: int,
        balance_after: int,
        reason: str,
        job_id: Optional[ObjectId] = None,
        razorpay_order_id: Optional[str] = None,
        admin_id: Optional[ObjectId] = None
    ) -> Dict[str, Any]:
        """Create a new credit ledger entry."""
        return {
            "userId": user_id,
            "change": change,
            "balanceAfter": balance_after,
            "reason": reason,
            "jobId": job_id,
            "razorpayOrderId": razorpay_order_id,
            "adminId": admin_id,
            "createdAt": datetime.now(timezone.utc)
        }

class DeletionQueueModel:
    """Deletion queue document schema and operations."""

    @staticmethod
    def create_deletion_entry(
        generation_doc: Dict[str, Any],
        next_try_at: datetime
    ) -> Dict[str, Any]:
        """Create a new deletion queue entry."""
        return {
            "generationDoc": generation_doc,
            "attempts": 0,
            "nextTryAt": next_try_at,
            "createdAt": datetime.now(timezone.utc)
        }

# Database utility functions
def get_user_by_auth_id(auth_provider_id: str) -> Optional[Dict[str, Any]]:
    """Get user by auth provider ID."""
    db = get_db()
    return db.users.find_one({"authProviderId": auth_provider_id})

def get_user_by_id(user_id: ObjectId) -> Optional[Dict[str, Any]]:
    """Get user by ID."""
    db = get_db()
    return db.users.find_one({"_id": user_id})

def update_user_credits(user_id: ObjectId, credit_change: int) -> bool:
    """Atomically update user credits and return success status."""
    db = get_db()

    if credit_change < 0:
        # Deduction - ensure sufficient credits
        result = db.users.find_one_and_update(
            {"_id": user_id, "credits": {"$gte": abs(credit_change)}},
            {"$inc": {"credits": credit_change}, "$set": {"updatedAt": datetime.now(timezone.utc)}},
            return_document=True
        )
    else:
        # Addition - no constraints
        result = db.users.find_one_and_update(
            {"_id": user_id},
            {"$inc": {"credits": credit_change}, "$set": {"updatedAt": datetime.now(timezone.utc)}},
            return_document=True
        )

    return result is not None

def get_user_generations(user_id: ObjectId, limit: int = 30) -> List[Dict[str, Any]]:
    """Get user's generations sorted by creation date."""
    db = get_db()
    return list(db.generations.find(
        {"userId": user_id}
    ).sort("createdAt", DESCENDING).limit(limit))

def cleanup_old_generations(user_id: ObjectId, max_count: int = 30):
    """Remove old generations beyond the specified limit."""
    db = get_db()

    # Count current generations
    count = db.generations.count_documents({"userId": user_id})

    if count > max_count:
        excess_count = count - max_count

        # Get oldest generations to delete
        old_generations = list(db.generations.find(
            {"userId": user_id}
        ).sort("createdAt", ASCENDING).limit(excess_count))

        for generation in old_generations:
            # Mark for deletion (implement deletion queue logic here)
            deletion_entry = DeletionQueueModel.create_deletion_entry(
                generation,
                datetime.now(timezone.utc)
            )
            db.deletion_queue.insert_one(deletion_entry)

            # Remove from generations
            db.generations.delete_one({"_id": generation["_id"]})

        logger.info(f"Cleaned up {excess_count} old generations for user {user_id}")

def create_job_with_deduction(
    client_job_id: str,
    user_id: ObjectId,
    module: str,
    params: Dict[str, Any],
    credit_cost: int
) -> Optional[ObjectId]:
    """Create job with atomic credit deduction."""
    db = get_db()

    # Start a transaction
    with db.client.start_session() as session:
        with session.start_transaction():
            try:
                # Deduct credits atomically
                user_update_result = db.users.find_one_and_update(
                    {"_id": user_id, "credits": {"$gte": credit_cost}},
                    {
                        "$inc": {"credits": -credit_cost},
                        "$set": {"updatedAt": datetime.now(timezone.utc)}
                    },
                    return_document=True,
                    session=session
                )

                if not user_update_result:
                    session.abort_transaction()
                    return None  # Insufficient credits

                # Create job
                job_doc = JobModel.create_job(client_job_id, user_id, module, params, credit_cost)
                job_result = db.jobs.insert_one(job_doc, session=session)

                # Create ledger entry
                ledger_entry = CreditLedgerModel.create_ledger_entry(
                    user_id=user_id,
                    change=-credit_cost,
                    balance_after=user_update_result["credits"],
                    reason="generate",
                    job_id=job_result.inserted_id
                )
                db.credit_ledger.insert_one(ledger_entry, session=session)

                session.commit_transaction()
                return job_result.inserted_id

            except Exception as e:
                session.abort_transaction()
                logger.error(f"Failed to create job with credit deduction: {e}")
                return None

def refund_job_credits(
    job_id: ObjectId,
    user_id: ObjectId,
    refund_amount: int,
    admin_id: Optional[ObjectId] = None,
    reason: str = "job_failed"
) -> bool:
    """Refund credits for a failed job."""
    db = get_db()

    with db.client.start_session() as session:
        with session.start_transaction():
            try:
                # Add credits back to user
                user_update_result = db.users.find_one_and_update(
                    {"_id": user_id},
                    {
                        "$inc": {"credits": refund_amount},
                        "$set": {"updatedAt": datetime.now(timezone.utc)}
                    },
                    return_document=True,
                    session=session
                )

                if not user_update_result:
                    session.abort_transaction()
                    return False

                # Create refund ledger entry
                ledger_entry = CreditLedgerModel.create_ledger_entry(
                    user_id=user_id,
                    change=refund_amount,
                    balance_after=user_update_result["credits"],
                    reason=reason,
                    job_id=job_id,
                    admin_id=admin_id
                )
                db.credit_ledger.insert_one(ledger_entry, session=session)

                session.commit_transaction()
                logger.info(f"Refunded {refund_amount} credits for job {job_id}")
                return True

            except Exception as e:
                session.abort_transaction()
                logger.error(f"Failed to refund credits for job {job_id}: {e}")
                return False

def get_user_credit_balance(user_id: ObjectId) -> int:
    """Get current credit balance for user."""
    db = get_db()
    user = db.users.find_one({"_id": user_id}, {"credits": 1})
    return user.get("credits", 0) if user else 0

def get_user_credit_history(user_id: ObjectId, limit: int = 50) -> List[Dict[str, Any]]:
    """Get user's credit transaction history."""
    db = get_db()
    return list(db.credit_ledger.find(
        {"userId": user_id}
    ).sort("createdAt", DESCENDING).limit(limit))

def validate_sufficient_credits(user_id: ObjectId, required_credits: int) -> bool:
    """Check if user has sufficient credits without deducting."""
    current_balance = get_user_credit_balance(user_id)
    return current_balance >= required_credits

# Initialize database connection on module import
try:
    db_manager.connect()
except Exception as e:
    logger.error(f"Failed to initialize database connection: {e}")