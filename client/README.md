# CBMS Frontend

College Budget Management System - Frontend built with React.js.

## 🚀 Features

- **Modern React Architecture**: Built with React 19 and modern hooks
- **Authentication System**: JWT-based authentication with context API
- **Role-Based Access Control**: Different dashboards and features for different user roles
- **Responsive Design**: Mobile-first responsive design with modern CSS
- **Component-Based**: Reusable components with proper separation of concerns
- **State Management**: Context API for global state management
- **Routing**: React Router for client-side routing
- **API Integration**: Axios for HTTP requests with interceptors

## 🛠️ Tech Stack

- **Frontend**: React.js 19
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern features
- **State Management**: React Context API
- **Build Tool**: Create React App

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

1. **Navigate to client directory**
   ```bash
   cd cbms/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open in your browser at `http://localhost:3000`

## 🏗️ Project Structure

```
client/src/
├── components/          # Reusable components
│   ├── Layout/         # Layout components
│   │   ├── Header.js
│   │   ├── Header.css
│   │   ├── Layout.js
│   │   └── Layout.css
│   └── ProtectedRoute.js
├── context/            # React Context providers
│   └── AuthContext.js
├── pages/              # Page components
│   ├── Login.js
│   ├── Login.css
│   ├── Dashboard.js
│   └── Dashboard.css
├── services/           # API services
│   └── api.js
├── App.js             # Main App component
├── App.css            # Global styles
└── index.js           # Entry point
```

## 🔐 User Roles & Features

### System Admin
- User management (CRUD operations)
- Department management
- Budget head management
- System settings
- Complete system access

### Finance Officer
- Budget allocation management
- Expenditure approvals
- Report generation
- Department overview

### Department User
- Submit expenditure requests
- View expenditure history
- Track budget status
- View department reports

### Head of Department (HOD)
- Review department expenditures
- Verify expenditure requests
- Department-specific approvals
- Department reports

### Vice Principal / Principal
- High-value approvals
- Consolidated reports
- Budget overview
- Department analysis

### Auditor
- Read-only access to all data
- Audit log review
- Financial reports
- Compliance checking

## 🎨 Design System

### Color Palette
- **Primary**: #667eea (Blue)
- **Secondary**: #764ba2 (Purple)
- **Success**: #28a745 (Green)
- **Warning**: #ffc107 (Yellow)
- **Danger**: #dc3545 (Red)
- **Info**: #17a2b8 (Cyan)
- **Dark**: #2c3e50 (Dark Blue)
- **Light**: #f8f9fa (Light Gray)

### Typography
- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Font Weights**: 400 (Regular), 600 (Semi-bold), 700 (Bold)
- **Font Sizes**: Responsive scaling from 0.875rem to 2.5rem

### Components
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Gradient backgrounds, hover animations
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with role-based menu items

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

### Mobile Features
- Collapsible navigation menu
- Touch-friendly buttons and inputs
- Optimized layouts for small screens
- Swipe gestures support

## 🔌 API Integration

### Authentication Flow
1. User logs in with email/password
2. JWT token received and stored in localStorage
3. Token automatically attached to all API requests
4. Automatic logout on token expiration

### Error Handling
- Global error interceptor for API responses
- User-friendly error messages
- Automatic retry for network errors
- Loading states for better UX

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 📦 Build & Deployment

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Deploy to Static Hosting
The `build` folder contains the production-ready files that can be deployed to:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## 🔒 Security Features

- **JWT Token Management**: Secure token storage and automatic refresh
- **Route Protection**: Protected routes based on authentication status
- **Role-Based Access**: Different features for different user roles
- **Input Validation**: Client-side validation for all forms
- **XSS Protection**: Sanitized inputs and outputs

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized images and lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Efficient caching strategies
- **Minification**: Minified CSS and JavaScript in production

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Coverage
- Component unit tests
- Integration tests
- User interaction tests
- API integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Future Enhancements

- **PWA Support**: Progressive Web App features
- **Offline Mode**: Offline functionality with service workers
- **Real-time Updates**: WebSocket integration for real-time notifications
- **Advanced Charts**: Interactive charts and graphs
- **Dark Mode**: Dark theme support
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support