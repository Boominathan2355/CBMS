# CBMS Backend API

College Budget Management System - Backend API built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC)
- **User Management**: Complete CRUD operations for users with different roles
- **Department Management**: Manage college departments and HOD assignments
- **Budget Head Management**: Create and manage budget categories
- **File Upload**: Secure file upload for expenditure attachments
- **Audit Logging**: Comprehensive audit trail for all actions
- **Data Validation**: Robust input validation and error handling
- **Security**: Password hashing, rate limiting, and security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **SendGrid** - Email service
- **Security**: Helmet, Express Rate Limit

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cbms/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/cbms
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Email Configuration (SendGrid)
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=CBMS System
   
   # AWS S3 Configuration (Optional)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=cbms-attachments
   
   # File Upload Limits
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/register` - Register new user (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/role/:role` - Get users by role (Admin only)
- `GET /api/users/stats` - Get user statistics (Admin only)

### Departments
- `GET /api/departments` - Get all departments (Admin only)
- `GET /api/departments/:id` - Get department by ID (Admin only)
- `POST /api/departments` - Create department (Admin only)
- `PUT /api/departments/:id` - Update department (Admin only)
- `DELETE /api/departments/:id` - Delete department (Admin only)
- `GET /api/departments/stats` - Get department statistics (Admin only)

### Budget Heads
- `GET /api/budget-heads` - Get all budget heads (Admin only)
- `GET /api/budget-heads/:id` - Get budget head by ID (Admin only)
- `POST /api/budget-heads` - Create budget head (Admin only)
- `PUT /api/budget-heads/:id` - Update budget head (Admin only)
- `DELETE /api/budget-heads/:id` - Delete budget head (Admin only)
- `GET /api/budget-heads/stats` - Get budget head statistics (Admin only)

## 🔐 User Roles

1. **admin**: System administrator with full access
2. **office**: Finance officer for budget allocation and approval
3. **department**: Department user for expenditure submission
4. **hod**: Head of Department for verification
5. **vice_principal**: Vice Principal for approvals
6. **principal**: Principal for top-level approvals
7. **auditor**: Read-only access for audit purposes

## 📁 Project Structure

```
server/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── departmentController.js
│   └── budgetHeadController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── fileUpload.js
├── models/              # MongoDB models
│   ├── User.js
│   ├── Department.js
│   ├── BudgetHead.js
│   ├── Allocation.js
│   ├── Expenditure.js
│   └── AuditLog.js
├── routes/              # API routes
│   ├── auth.js
│   ├── users.js
│   ├── departments.js
│   └── budgetHeads.js
├── uploads/             # File upload directory
├── index.js            # Main server file
├── package.json
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: Comprehensive data validation
- **File Upload Security**: Type and size restrictions
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js for security headers
- **Audit Logging**: Complete audit trail

## 📊 Database Models

### User
- Personal information and authentication
- Role-based access control
- Department association

### Department
- Department information
- HOD assignment
- Active/inactive status

### BudgetHead
- Budget category management
- Category classification
- Created by tracking

### Allocation
- Budget allocation per department/budget head
- Financial year tracking
- Spent and remaining amounts

### Expenditure
- Expenditure submission
- Multi-level approval workflow
- File attachments
- Status tracking

### AuditLog
- Complete audit trail
- Event tracking
- Actor and action details

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

Run tests (when implemented):
```bash
npm test
```

## 📝 API Documentation

The API follows RESTful conventions with consistent response formats:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
