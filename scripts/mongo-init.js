// MongoDB initialization script for CBMS
// This script runs when the MongoDB container starts for the first time

// Switch to the CBMS database
db = db.getSiblingDB('cbms');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        name: {
          bsonType: 'object',
          required: ['first', 'last'],
          properties: {
            first: { bsonType: 'string' },
            last: { bsonType: 'string' }
          }
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'office', 'department', 'hod', 'vice_principal', 'principal', 'auditor']
        }
      }
    }
  }
});

db.createCollection('departments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'code'],
      properties: {
        name: { bsonType: 'string' },
        code: { bsonType: 'string' },
        description: { bsonType: 'string' },
        isActive: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('budgetheads', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category'],
      properties: {
        name: { bsonType: 'string' },
        category: { bsonType: 'string' },
        description: { bsonType: 'string' },
        isActive: { bsonType: 'bool' }
      }
    }
  }
});

db.createCollection('allocations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['department', 'budgetHead', 'amount', 'financialYear'],
      properties: {
        department: { bsonType: 'objectId' },
        budgetHead: { bsonType: 'objectId' },
        amount: { bsonType: 'number', minimum: 0 },
        financialYear: { bsonType: 'string' },
        spentAmount: { bsonType: 'number', minimum: 0 },
        remainingAmount: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});

db.createCollection('expenditures', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['department', 'budgetHead', 'amount', 'description', 'status'],
      properties: {
        department: { bsonType: 'objectId' },
        budgetHead: { bsonType: 'objectId' },
        amount: { bsonType: 'number', minimum: 0 },
        description: { bsonType: 'string' },
        status: {
          bsonType: 'string',
          enum: ['pending', 'approved', 'rejected', 'under_review']
        },
        submittedBy: { bsonType: 'objectId' },
        approvedBy: { bsonType: 'objectId' }
      }
    }
  }
});

db.createCollection('auditlogs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['action', 'actor', 'entity', 'entityId'],
      properties: {
        action: { bsonType: 'string' },
        actor: { bsonType: 'objectId' },
        entity: { bsonType: 'string' },
        entityId: { bsonType: 'objectId' },
        details: { bsonType: 'object' },
        ipAddress: { bsonType: 'string' },
        userAgent: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['recipient', 'type', 'title', 'message'],
      properties: {
        recipient: { bsonType: 'objectId' },
        type: {
          bsonType: 'string',
          enum: ['info', 'success', 'warning', 'error', 'approval', 'rejection']
        },
        title: { bsonType: 'string' },
        message: { bsonType: 'string' },
        isRead: { bsonType: 'bool' },
        readAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });

db.departments.createIndex({ code: 1 }, { unique: true });
db.departments.createIndex({ name: 1 });
db.departments.createIndex({ isActive: 1 });

db.budgetheads.createIndex({ name: 1 });
db.budgetheads.createIndex({ category: 1 });
db.budgetheads.createIndex({ isActive: 1 });

db.allocations.createIndex({ department: 1, budgetHead: 1, financialYear: 1 }, { unique: true });
db.allocations.createIndex({ department: 1 });
db.allocations.createIndex({ budgetHead: 1 });
db.allocations.createIndex({ financialYear: 1 });

db.expenditures.createIndex({ department: 1 });
db.expenditures.createIndex({ budgetHead: 1 });
db.expenditures.createIndex({ status: 1 });
db.expenditures.createIndex({ submittedBy: 1 });
db.expenditures.createIndex({ createdAt: -1 });

db.auditlogs.createIndex({ actor: 1 });
db.auditlogs.createIndex({ entity: 1, entityId: 1 });
db.auditlogs.createIndex({ createdAt: -1 });
db.auditlogs.createIndex({ action: 1 });

db.notifications.createIndex({ recipient: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });
db.notifications.createIndex({ type: 1 });

// Create a default admin user (password: admin123)
db.users.insertOne({
  email: 'admin@cbms.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Qz8K2C', // admin123
  name: {
    first: 'System',
    last: 'Administrator'
  },
  role: 'admin',
  department: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create sample departments
db.departments.insertMany([
  {
    name: 'Computer Science',
    code: 'CS',
    description: 'Computer Science and Engineering Department',
    hod: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Electronics and Communication',
    code: 'ECE',
    description: 'Electronics and Communication Engineering Department',
    hod: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Mechanical Engineering Department',
    hod: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Civil Engineering Department',
    hod: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create sample budget heads
db.budgetheads.insertMany([
  {
    name: 'Laboratory Equipment',
    category: 'Equipment',
    description: 'Purchase and maintenance of laboratory equipment',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Stationery and Supplies',
    category: 'Supplies',
    description: 'Office stationery and general supplies',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Travel and Conferences',
    category: 'Travel',
    description: 'Faculty and student travel for conferences and seminars',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Software Licenses',
    category: 'Software',
    description: 'Software licenses and subscriptions',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Maintenance and Repairs',
    category: 'Maintenance',
    description: 'Building and equipment maintenance',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('CBMS database initialized successfully!');
print('Default admin user created: admin@cbms.com (password: admin123)');
print('Sample departments and budget heads created.');
