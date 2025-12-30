import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiUser, HiLogout } from 'react-icons/hi';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              UserMS
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Profile Picture */}
            <Link to="/profile" className="flex items-center">
              {user?.profile_picture_url ? (
                <img 
                  src={user.profile_picture_url} 
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            
            <span className="text-gray-700">
              Welcome, <span className="font-semibold">{user?.full_name}</span>
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {user?.role}
            </span>
            
            {user?.role === ROLES.ADMIN && (
              <Link 
                to="/admin/dashboard" 
                className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            <Link 
              to="/profile" 
              className="px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center"
            >
              <HiUser className="mr-1" /> Profile
            </Link>
            
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <HiLogout className="mr-1" /> Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
            <div className="px-3 py-2 text-gray-700">
              <p className="font-semibold">{user?.full_name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>
            
            {user?.role === ROLES.ADMIN && (
              <Link 
                to="/admin/dashboard" 
                className="block px-3 py-2 rounded-md hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            <Link 
              to="/profile" 
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
            
            <button 
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }} 
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
