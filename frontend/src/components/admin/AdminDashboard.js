import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  CurrencyDollarIcon,
  DocumentIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  KeyIcon,
  ArrowDownTrayIcon,
  BellIcon,
  BookOpenIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

import AdminOverview from './AdminOverview';
import StudentManagement from './StudentManagement';
import AcademicManagement from './AcademicManagement';
import FinanceManagement from './FinanceManagement';
import CertificateManagement from './CertificateManagement';
import PasswordResetManagement from './PasswordResetManagement';
import DownloadsManagement from './DownloadsManagement';
import NotificationsManagement from './NotificationsManagement';
import ResourcesManagement from './ResourcesManagement';
import WiFiManagement from './WiFiManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const pageName = navigation.find(item => item.current)?.name || 'Admin Dashboard';
    document.title = `TWOEM | ${pageName}`;
  }, [location.pathname]);

  const navigation = [
    { name: 'Overview', href: '/admin', icon: HomeIcon, current: location.pathname === '/admin' },
    { name: 'Students', href: '/admin/students', icon: UserGroupIcon, current: location.pathname === '/admin/students' },
    { name: 'Academics', href: '/admin/academics', icon: AcademicCapIcon, current: location.pathname === '/admin/academics' },
    { name: 'Finance', href: '/admin/finance', icon: CurrencyDollarIcon, current: location.pathname === '/admin/finance' },
    { name: 'Certificates', href: '/admin/certificates', icon: DocumentIcon, current: location.pathname === '/admin/certificates' },
    { name: 'Password Resets', href: '/admin/password-resets', icon: KeyIcon, current: location.pathname === '/admin/password-resets' },
    { name: 'Downloads', href: '/admin/downloads', icon: ArrowDownTrayIcon, current: location.pathname === '/admin/downloads' },
    { 
      name: 'Notifications', 
      href: '/admin/notifications', 
      icon: BellIcon, 
      current: location.pathname === '/admin/notifications',
      isNew: true 
    },
    { 
      name: 'Resources', 
      href: '/admin/resources', 
      icon: BookOpenIcon, 
      current: location.pathname === '/admin/resources',
      isNew: true 
    },
    { 
      name: 'WiFi Settings', 
      href: '/admin/wifi', 
      icon: WifiIcon, 
      current: location.pathname === '/admin/wifi',
      isNew: true 
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
          <img 
            src="/images/twoem.jpg" 
            alt="TWOEM Logo" 
            className="h-10 w-10 rounded-full mr-3 border-2 border-blue-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop&crop=center';
            }}
          />
          <div>
            <h2 className="text-white text-lg font-bold">TWOEM</h2>
            <p className="text-gray-300 text-xs">Admin Portal</p>
          </div>
        </div>

        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.isNew && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:bg-red-600 hover:text-white group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg w-full transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden hover:bg-gray-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find(item => item.current)?.name || 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your student portal
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="text-sm font-semibold text-gray-900">{user?.username}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-8 bg-gray-50">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="academics" element={<AcademicManagement />} />
            <Route path="finance" element={<FinanceManagement />} />
            <Route path="certificates" element={<CertificateManagement />} />
            <Route path="password-resets" element={<PasswordResetManagement />} />
            <Route path="downloads" element={<DownloadsManagement />} />
            <Route path="notifications" element={<NotificationsManagement />} />
            <Route path="resources" element={<ResourcesManagement />} />
            <Route path="wifi" element={<WiFiManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;