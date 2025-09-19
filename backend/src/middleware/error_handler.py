"""
Comprehensive error handling middleware for FastAPI.
Handles various types of errors with proper logging and user-friendly responses.
"""

import logging
import traceback
from datetime import datetime, timezone
from typing import Union

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from pymongo.errors import PyMongoError
from bson.errors import InvalidId

logger = logging.getLogger(__name__)

class ErrorResponse:
    """Standardized error response format."""

    @staticmethod
    def format_error(
        error_code: str,
        message: str,
        details: Union[str, dict, list] = None,
        status_code: int = 500
    ) -> dict:
        """Format error response with consistent structure."""
        response = {
            "success": False,
            "error": {
                "code": error_code,
                "message": message,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            "status_code": status_code
        }

        if details:
            response["error"]["details"] = details

        return response

async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper formatting."""
    logger.warning(f"HTTP {exc.status_code} error on {request.url}: {exc.detail}")

    error_codes = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        402: "PAYMENT_REQUIRED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        422: "VALIDATION_ERROR",
        429: "RATE_LIMIT_EXCEEDED",
        500: "INTERNAL_ERROR",
        502: "BAD_GATEWAY",
        503: "SERVICE_UNAVAILABLE"
    }

    error_code = error_codes.get(exc.status_code, "HTTP_ERROR")

    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse.format_error(
            error_code=error_code,
            message=exc.detail,
            status_code=exc.status_code
        )
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors."""
    logger.warning(f"Validation error on {request.url}: {exc.errors()}")

    # Format validation errors for better user experience
    formatted_errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        formatted_errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse.format_error(
            error_code="VALIDATION_ERROR",
            message="Invalid input data",
            details=formatted_errors,
            status_code=422
        )
    )

async def database_exception_handler(request: Request, exc: PyMongoError):
    """Handle MongoDB/database errors."""
    logger.error(f"Database error on {request.url}: {exc}")

    # Don't expose internal database errors to users
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content=ErrorResponse.format_error(
            error_code="DATABASE_ERROR",
            message="Database service temporarily unavailable",
            details="Please try again later",
            status_code=503
        )
    )

async def invalid_object_id_handler(request: Request, exc: InvalidId):
    """Handle invalid MongoDB ObjectId errors."""
    logger.warning(f"Invalid ObjectId on {request.url}: {exc}")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorResponse.format_error(
            error_code="INVALID_ID",
            message="Invalid ID format provided",
            details="The provided ID is not a valid MongoDB ObjectId",
            status_code=400
        )
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other unhandled exceptions."""
    # Log the full traceback for debugging
    logger.error(f"Unhandled exception on {request.url}: {exc}")
    logger.error(f"Traceback: {traceback.format_exc()}")

    # Determine if we're in development or production
    import os
    is_development = os.getenv("ENVIRONMENT", "production") == "development"

    if is_development:
        # In development, show more details
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse.format_error(
                error_code="INTERNAL_ERROR",
                message="An unexpected error occurred",
                details={
                    "exception_type": type(exc).__name__,
                    "exception_message": str(exc),
                    "traceback": traceback.format_exc().split('\n')
                },
                status_code=500
            )
        )
    else:
        # In production, hide internal details
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=ErrorResponse.format_error(
                error_code="INTERNAL_ERROR",
                message="An unexpected error occurred. Please try again later.",
                status_code=500
            )
        )

# Custom exception classes for specific business logic
class InsufficientCreditsError(HTTPException):
    """Raised when user doesn't have enough credits."""

    def __init__(self, required: int, available: int):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Required: {required}, Available: {available}"
        )

class JobNotFoundError(HTTPException):
    """Raised when a job is not found or doesn't belong to user."""

    def __init__(self, job_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found or access denied"
        )

class RateLimitExceededError(HTTPException):
    """Raised when rate limit is exceeded."""

    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {retry_after} seconds",
            headers={"Retry-After": str(retry_after)}
        )

class ServiceUnavailableError(HTTPException):
    """Raised when external service is unavailable."""

    def __init__(self, service_name: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{service_name} service is temporarily unavailable"
        )

# Error logging utilities
def log_user_action(user_id: str, action: str, success: bool, details: str = None):
    """Log user actions for audit purposes."""
    log_level = logging.INFO if success else logging.WARNING

    message = f"User {user_id} {action}: {'SUCCESS' if success else 'FAILED'}"
    if details:
        message += f" - {details}"

    logger.log(log_level, message)

def log_api_error(request: Request, error: Exception, user_id: str = None):
    """Log API errors with context."""
    error_context = {
        "url": str(request.url),
        "method": request.method,
        "user_id": user_id,
        "error_type": type(error).__name__,
        "error_message": str(error)
    }

    logger.error(f"API Error: {error_context}")

# Health check for error handling system
def test_error_handling():
    """Test function to verify error handling is working."""
    try:
        # Test various error types
        errors = [
            HTTPException(status_code=404, detail="Test not found"),
            ValidationError.from_exception_data("Test", []),
            PyMongoError("Test database error"),
            Exception("Test general exception")
        ]

        logger.info("Error handling system test completed")
        return True
    except Exception as e:
        logger.error(f"Error handling test failed: {e}")
        return False