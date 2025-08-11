// MongoDB initialization script
db = db.getSiblingDB('ai-health-care');

// Create collections
db.createCollection('admins');

// Create indexes for better performance
db.admins.createIndex({ "email": 1 }, { unique: true });
db.admins.createIndex({ "role": 1 });
db.admins.createIndex({ "isBlocked": 1 });
db.admins.createIndex({ "isEmailVerified": 1 });

print('MongoDB initialization completed successfully!');
