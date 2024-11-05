import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LogOut, Menu, X, Home, Users, FileText, 
  Settings, Map, Activity, LayoutGrid 
} from 'lucide-react';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      clearAuth();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast.error('Error logging out. Please try again.');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    ...(userRole === 'superadmin' ? [
      { icon: Users, label: 'User Management', path: '/dashboard/users' },
      { icon: LayoutGrid, label: 'Area Management', path: '/dashboard/areas' },
      { icon: Map, label: 'Worker Map', path: '/dashboard/map' }
    ] : []),
    ...(userRole === 'worker' ? [
      { icon: Activity, label: 'My Activities', path: '/dashboard/activities' },
      { icon: FileText, label: 'My Reports', path: '/dashboard/reports' }
    ] : []),
    ...(userRole === 'president' ? [
      { icon: Map, label: 'Worker Map', path: '/dashboard/map' },
      { icon: FileText, label: 'All Reports', path: '/dashboard/all-reports' },
      { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Municipal Work</h2>
            <p className="text-sm text-gray-600 mt-1 capitalize">{userRole}</p>
          </div>

          <nav className="flex-1 px-4 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 w-full px-4 py-2 rounded-lg hover:bg-red-50 transition duration-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-40 lg:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main content */}
      <div className="flex-1 min-h-screen">
        <main className="p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Layout;