# MongoDB Migration Guide

This project has been migrated from PostgreSQL to MongoDB. Here's what has been changed and how to set it up.

## Changes Made

### 1. Dependencies Updated
- **Removed**: `@nestjs/typeorm`, `typeorm`, `pg`
- **Added**: `@nestjs/mongoose`, `mongoose`

### 2. Database Configuration
- Updated `src/app.module.ts` to use `MongooseModule` instead of `TypeOrmModule`
- Removed `ormconfig.ts` (TypeORM configuration)
- Updated environment variables in `env.example`

### 3. Entity to Schema Conversion
- Converted `src/admin/entities/admin.entity.ts` from TypeORM entity to Mongoose schema
- Updated all database operations in `src/admin/services/admin.service.ts`
- Changed ID fields from `number` to `string` (MongoDB ObjectId)

### 4. DTO Updates
- Updated `src/admin/dtos/update_admin_role.dto.ts` to use `@IsMongoId()` validation
- Updated `src/admin/dtos/admins_listing.dto.ts` to use `@IsMongoId()` validation

## Setup Instructions

### 1. Environment Variables
Update your environment file with MongoDB configuration:

```env
# Database Connection
MONGODB_URI=mongodb://localhost:27017/ai-health-care
MONGODB_DATABASE=ai-health-care

# Generic Configuration
DEFAULT_PASSWORD=123456789
DEFAULT_ADMIN_NAME=Admin
JWT_ENCRYPTION_KEY=wdhevf7383783fujefu3ei3
JWT_TOKEN_EXPIRY_TIME=300000
```

### 2. Using Docker Compose (Recommended)
```bash
# Start MongoDB and Mongo Express
docker-compose up -d

# MongoDB will be available at: mongodb://localhost:27017
# Mongo Express (web interface) will be available at: http://localhost:8081
# Login with: admin/password
```

### 3. Manual MongoDB Setup
If you prefer to install MongoDB locally:

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `ai-health-care`
4. The application will automatically create collections and indexes

### 4. Install Dependencies
```bash
pnpm install
```

### 5. Run the Application
```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## Key Differences from PostgreSQL

### 1. ID Fields
- **Before**: `id: number` (auto-increment)
- **After**: `_id: string` (MongoDB ObjectId)

### 2. Database Operations
- **Before**: TypeORM Repository methods (`findOneBy`, `insert`, `update`, etc.)
- **After**: Mongoose Model methods (`findOne`, `save`, `updateOne`, etc.)

### 3. Queries
- **Before**: SQL-like queries with `FindOptionsWhere`
- **After**: MongoDB query objects with `$regex`, `$or`, etc.

### 4. Migrations
- **Before**: TypeORM migrations
- **After**: No migrations needed (MongoDB is schema-less)

## Database Schema

### Admin Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (required),
  isEmailVerified: Boolean (default: false),
  firstName: String,
  lastName: String,
  twoFaAuth: String,
  isTwoFaEnable: Boolean (default: false),
  isBlocked: Boolean (default: false),
  role: String (enum: Roles),
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes Created
- `email` (unique)
- `role`
- `isBlocked`
- `isEmailVerified`

## Troubleshooting

### 1. Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` environment variable
- Verify network connectivity

### 2. Validation Errors
- Ensure all required fields are provided
- Check MongoDB ObjectId format for ID fields
- Verify enum values match defined roles

### 3. Performance Issues
- Indexes are automatically created
- Consider adding compound indexes for complex queries
- Monitor query performance using MongoDB profiler

## Migration Notes

- All existing PostgreSQL data will need to be migrated manually
- Consider using MongoDB Compass or similar tools for data migration
- Test thoroughly in development before deploying to production
- Update any external integrations that depend on PostgreSQL-specific features
