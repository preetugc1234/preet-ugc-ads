# Core APIs Documentation

## 🚀 Complete Core API Suite

Your FastAPI backend now includes comprehensive Core APIs with authentication, user management, health monitoring, and error handling.

---

## 📊 API Overview

### **Authentication APIs (`/api/auth/*`)**
- ✅ **User authentication** with Supabase JWT
- ✅ **Profile management**
- ✅ **Admin operations**
- ✅ **Credit tracking**

### **User Management APIs (`/api/user/*`)**
- ✅ **Profile operations**
- ✅ **Credit system**
- ✅ **Generation history**
- ✅ **Account management**

### **Health & Monitoring (`/api/health/*`)**
- ✅ **System health checks**
- ✅ **Database monitoring**
- ✅ **Service status**
- ✅ **Metrics collection**

---

## 🔐 Authentication Endpoints

### **Public Endpoints**
```bash
GET  /api/auth/status           # Check auth system status
```

### **Protected Endpoints**
```bash
GET  /api/auth/me               # Get current user profile
PUT  /api/auth/me               # Update user profile
GET  /api/auth/me/credits       # Get credit history
```

### **Admin Endpoints**
```bash
GET  /api/auth/users            # List all users
GET  /api/auth/users/{id}       # Get user by ID
PUT  /api/auth/users/{id}       # Update user (admin)
POST /api/auth/users/{id}/gift-credits # Gift credits
GET  /api/auth/admin/stats      # System statistics
```

---

## 👤 User Management Endpoints

### **Profile Management**
```bash
GET  /api/user/profile          # Detailed user profile
PUT  /api/user/profile          # Update profile
GET  /api/user/stats            # User statistics
PUT  /api/user/plan             # Change subscription plan
DELETE /api/user/account        # Delete account
```

### **Credit System**
```bash
GET  /api/user/credits          # Credit history & transactions
GET  /api/user/credits/balance  # Current balance (quick)
```

### **Generation History**
```bash
GET  /api/user/history          # User's generations (max 30)
DELETE /api/user/history/{id}   # Delete specific generation
DELETE /api/user/history/cleanup # Manual cleanup
```

---

## 🏥 Health & Monitoring Endpoints

### **Health Checks**
```bash
GET  /api/health/               # Quick health (for load balancers)
GET  /api/health/detailed       # Comprehensive health check
GET  /api/health/database       # Database-specific health
GET  /api/health/auth           # Authentication health
GET  /api/health/status         # Simple status
```

### **Metrics** (Optional Auth)
```bash
GET  /api/health/metrics        # System metrics
```

---

## 📝 Request/Response Examples

### **Get User Profile**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://preet-ugc-ads.onrender.com/api/user/profile
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "free",
  "credits": 500,
  "is_admin": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### **Update Profile**
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "John Smith"}' \
     https://preet-ugc-ads.onrender.com/api/user/profile
```

### **Get Credit History**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://preet-ugc-ads.onrender.com/api/user/credits?limit=10
```

**Response:**
```json
{
  "current_balance": 450,
  "transactions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "change": -50,
      "balance_after": 450,
      "reason": "generate",
      "created_at": "2024-01-01T12:00:00Z",
      "job_id": "507f1f77bcf86cd799439013"
    }
  ],
  "total_earned": 500,
  "total_spent": 50
}
```

### **Health Check**
```bash
curl https://preet-ugc-ads.onrender.com/api/health/
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "database": "healthy",
    "authentication": "healthy",
    "api": "healthy"
  }
}
```

---

## 🛡️ Error Handling

### **Standardized Error Response**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "timestamp": "2024-01-01T12:00:00Z",
    "details": "Additional error context"
  },
  "status_code": 401
}
```

### **Error Codes**
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `VALIDATION_ERROR` (422) - Invalid input data
- `PAYMENT_REQUIRED` (402) - Insufficient credits
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `DATABASE_ERROR` (503) - Database unavailable
- `INTERNAL_ERROR` (500) - Server error

---

## ✅ Input Validation

### **Profile Update**
```json
{
  "name": "string (2-100 chars, optional)"
}
```

### **Plan Change**
```json
{
  "plan": "free | pro | enterprise"
}
```

### **Credit Gift (Admin)**
```json
{
  "credits": "positive integer",
  "reason": "string (optional)"
}
```

---

## 🔧 Features Included

### **Security**
- ✅ JWT token verification
- ✅ Role-based access control
- ✅ Input validation with Pydantic
- ✅ Rate limiting ready
- ✅ CORS configuration

### **Database**
- ✅ MongoDB Atlas integration
- ✅ Atomic credit operations
- ✅ Transaction history
- ✅ Auto-cleanup (30-item limit)

### **Monitoring**
- ✅ Health checks for all services
- ✅ Detailed error logging
- ✅ Performance metrics
- ✅ Uptime tracking

### **User Experience**
- ✅ Comprehensive error messages
- ✅ Consistent response format
- ✅ Auto-generated documentation
- ✅ Input validation feedback

---

## 📚 API Documentation

### **Interactive Documentation**
- **Swagger UI**: `https://preet-ugc-ads.onrender.com/docs`
- **ReDoc**: `https://preet-ugc-ads.onrender.com/redoc`
- **OpenAPI JSON**: `https://preet-ugc-ads.onrender.com/openapi.json`

### **Testing**
All endpoints are ready for testing with:
- **Postman collections**
- **curl commands**
- **Frontend integration**
- **Automated testing**

---

## 🚀 Production Ready

Your Core APIs are **production-ready** with:

- ✅ **Authentication**: Secure JWT-based auth
- ✅ **User Management**: Complete CRUD operations
- ✅ **Credit System**: Atomic transactions & history
- ✅ **Health Monitoring**: Comprehensive system checks
- ✅ **Error Handling**: Standardized responses
- ✅ **Documentation**: Auto-generated & interactive
- ✅ **Validation**: Input sanitization & validation
- ✅ **Logging**: Detailed error & action logs

**Ready for frontend integration and deployment!** 🎉