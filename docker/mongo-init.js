// MongoDB initialization script
// Created by Aayush Vaghela (https://github.com/AAYUSH412)

print('🚀 Initializing Face Recognition Attendance System Database...');

// Switch to the application database
db = db.getSiblingDB('face_recognition_db');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password_123',
  roles: [
    {
      role: 'readWrite',
      db: 'face_recognition_db'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email"
        },
        name: {
          bsonType: "string",
          minLength: 2,
          description: "must be a string with at least 2 characters"
        },
        role: {
          enum: ["student", "admin", "faculty"],
          description: "must be one of the allowed roles"
        }
      }
    }
  }
});

db.createCollection('events', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "date", "createdBy"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 3,
          description: "must be a string with at least 3 characters"
        },
        date: {
          bsonType: "date",
          description: "must be a valid date"
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "studentId": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "department": 1 });
db.users.createIndex({ "role": 1 });

db.events.createIndex({ "date": 1 });
db.events.createIndex({ "createdBy": 1 });
db.events.createIndex({ "departments": 1 });

db.attendance.createIndex({ "userId": 1, "eventId": 1 }, { unique: true });
db.attendance.createIndex({ "eventId": 1 });
db.attendance.createIndex({ "timestamp": 1 });

db.departments.createIndex({ "name": 1 }, { unique: true });

// Insert default data
print('📝 Inserting default data...');

// Default departments
db.departments.insertMany([
  {
    name: "Computer Science",
    code: "CSE",
    description: "Computer Science and Engineering Department",
    createdAt: new Date()
  },
  {
    name: "Information Technology",
    code: "IT",
    description: "Information Technology Department",
    createdAt: new Date()
  },
  {
    name: "Electronics",
    code: "ECE",
    description: "Electronics and Communication Engineering",
    createdAt: new Date()
  },
  {
    name: "Mechanical",
    code: "MECH",
    description: "Mechanical Engineering Department",
    createdAt: new Date()
  }
]);

// Default admin user (password: admin123)
db.users.insertOne({
  name: "System Administrator",
  email: "admin@fras.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8uk0Lx.c5C", // bcrypt hash of 'admin123'
  role: "admin",
  department: null,
  isActive: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ Database initialization completed successfully!');
print('🔑 Default admin credentials:');
print('   Email: admin@fras.com');
print('   Password: admin123');
print('⚠️  Please change the default password after first login!');
