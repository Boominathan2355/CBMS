import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';
import {
  LayoutDashboard,
  LineChart,
  Users,
  Building2,
  Wallet,
  Settings,
  ClipboardList,
  CheckSquare,
  Calculator,
  User,
  Lock,
  LogOut,
  FileText,
  Search,
  PlusCircle,
  Files,
  Menu,
  GraduationCap,
  ChevronDown
} from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'System Admin',
      office: 'Finance Officer',
      department: 'Department User',
      hod: 'Head of Department',
      vice_principal: 'Vice Principal',
      principal: 'Principal',
      auditor: 'Auditor',
    };
    return roleNames[role] || role;
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
      { path: '/graphical-dashboard', label: 'Analytics', icon: <LineChart /> },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/users', label: 'Users', icon: <Users /> },
          { path: '/departments', label: 'Departments', icon: <Building2 /> },
          { path: '/budget-heads', label: 'Budget Heads', icon: <Wallet /> },
          { path: '/settings', label: 'Settings', icon: <Settings /> },
        ];
      case 'office':
        return [
          ...baseItems,
          { path: '/allocations', label: 'Allocations', icon: <ClipboardList /> },
          { path: '/approvals', label: 'Approvals', icon: <CheckSquare /> },
          { path: '/reports', label: 'Reports', icon: <FileText /> },
        ];
      case 'department':
        return [
          ...baseItems,
          { path: '/expenditures', label: 'My Expenditures', icon: <Calculator /> },
          { path: '/submit-expenditure', label: 'Submit Expenditure', icon: <PlusCircle /> },
        ];
      case 'hod':
        return [
          ...baseItems,
          { path: '/department-expenditures', label: 'Department Expenditures', icon: <Files /> },
          { path: '/approvals', label: 'Approvals', icon: <CheckSquare /> },
        ];
      case 'vice_principal':
      case 'principal':
        return [
          ...baseItems,
          { path: '/approvals', label: 'Approvals', icon: <CheckSquare /> },
          { path: '/reports', label: 'Reports', icon: <FileText /> },
          { path: '/consolidated-view', label: 'Consolidated View', icon: <LineChart /> },
        ];
      case 'auditor':
        return [
          ...baseItems,
          { path: '/audit-logs', label: 'Audit Logs', icon: <Search /> },
          { path: '/reports', label: 'Reports', icon: <FileText /> },
        ];
      default:
        return baseItems;
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-icon"><GraduationCap /></span>
          <span className="logo-text">CBMS</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {getNavigationItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link"
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Notifications */}
        <NotificationBell />

        {/* User Profile */}
        <div className="user-section">
          <div className="user-info" onClick={toggleProfile}>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{getRoleDisplayName(user?.role)}</span>
            </div>
            <span className="dropdown-arrow"><ChevronDown /></span>
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item">
                <span className="dropdown-icon"><User /></span>
                Profile
              </Link>
              <Link to="/change-password" className="dropdown-item">
                <span className="dropdown-icon"><Lock /></span>
                Change Password
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item logout-btn">
                <span className="dropdown-icon"><LogOut /></span>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
        {getNavigationItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="nav-link-mobile"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
        <div className="mobile-user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{getRoleDisplayName(user?.role)}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="mobile-logout-btn">
          Logout
        </button>
      </nav>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}
    </header>
  );
};

export default Header;
