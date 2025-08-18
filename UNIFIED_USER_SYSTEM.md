# Unified User System

This document describes the new unified user system that consolidates admin, doctor, and patient users into a single entity with userType distinction.

## Overview

The unified user system replaces the separate admin and doctor entities with a single `User` entity that uses a `userType` field to distinguish between different user types:
- `ADMIN` - System administrators
- `DOCTOR` - Medical doctors
- `PATIENT` - Patients (for future use)

## Key Features

### 1. Unified User Entity
- Single `User` entity with `userType` field
- Supports all user types with type-specific fields
- Common fields: email, password, firstName, lastName, phoneNumber, etc.
- Type-specific fields: role (admin), specialization (doctor), etc.

### 2. Common User Module
The `/user` endpoints handle common operations for all user types:
- `POST /user/login` - Login with userType validation
- `POST /user/forgot/password` - Forgot password
- `PUT /user/reset/password` - Reset password
- `GET /user/profile` - Get user profile
- `PUT /user/edit` - Edit user profile
- `PUT /user/change/password` - Change password

### 3. JWT Token Structure
JWT tokens now include `userType` for proper authentication:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "userType": "admin|doctor|patient",
  "role": "Super|Sub" // for admin users only
}
```

### 4. Updated Authentication
- `CommonAuthGuard` now validates based on `userType` in JWT
- No longer requires separate guard types
- Validates user existence and permissions based on userType

## API Endpoints

### User Module (Common Endpoints)
```
POST /user/login
POST /user/forgot/password
PUT /user/reset/password
GET /user/profile
PUT /user/edit
PUT /user/change/password
```

### Admin Module (Admin-specific Endpoints)
```
POST /admin/add
PUT /admin/block/toggle
PUT /admin/role
GET /admin/
```

### Doctor Module (Doctor-specific Endpoints)
```
POST /doctor/add
PUT /doctor/block/toggle
GET /doctor/
```

### Patient Module (Future Patient-specific Endpoints)
```
// To be implemented
```

## Validation

### Login Validation
- Email must be valid
- Password minimum 6 characters
- userType must be one of: admin, doctor, patient
- User must exist with matching email and userType
- User must be email verified and not blocked

### Profile Validation
- firstName, lastName, phoneNumber are optional
- Only provided fields are updated

### Password Validation
- Current password must match
- New password minimum 6 characters
- Password reset tokens include userType validation

## Migration

A migration service is provided to migrate existing admin and doctor data to the new unified user system:

```typescript
// Run migration
await migrationService.runMigration()
```

The migration:
1. Migrates all existing admins to users with userType: 'admin'
2. Migrates all existing doctors to users with userType: 'doctor'
3. Preserves all existing data and relationships
4. Prevents duplicate migrations

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (required),
  isEmailVerified: Boolean (default: false),
  firstName: String,
  lastName: String,
  phoneNumber: String,
  userType: String (enum: ['admin', 'doctor', 'patient'], required),
  
  // Admin-specific fields
  role: String (enum: ['Super', 'Sub']),
  
  // Doctor-specific fields
  specialization: String,
  licenseNumber: String,
  experience: Number,
  qualification: String,
  address: String,
  
  // Patient-specific fields (future)
  dateOfBirth: Date,
  gender: String,
  emergencyContact: String,
  
  // Common fields
  twoFaAuth: String,
  isTwoFaEnable: Boolean (default: false),
  isBlocked: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

1. **JWT Token Security**: Tokens include userType to prevent cross-user-type access
2. **Password Security**: All passwords are hashed using bcrypt
3. **Email Verification**: Users must verify email before accessing protected endpoints
4. **Account Blocking**: Blocked users cannot access any endpoints
5. **Role-based Access**: Admin users have role-based permissions

## Future Enhancements

1. **Patient Module**: Implement patient-specific functionality
2. **User Permissions**: Add granular permission system
3. **Audit Logging**: Track user actions and changes
4. **Multi-factor Authentication**: Enhanced 2FA support
5. **Session Management**: Track and manage user sessions

## Usage Examples

### Login as Admin
```bash
POST /user/login
{
  "email": "admin@example.com",
  "password": "password123",
  "userType": "admin"
}
```

### Login as Doctor
```bash
POST /user/login
{
  "email": "doctor@example.com",
  "password": "password123",
  "userType": "doctor"
}
```

### Get Profile (requires JWT)
```bash
GET /user/profile
Authorization: Bearer <jwt_token>
```

### Change Password (requires JWT)
```bash
PUT /user/change/password
Authorization: Bearer <jwt_token>
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

