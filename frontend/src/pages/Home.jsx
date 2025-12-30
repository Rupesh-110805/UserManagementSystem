import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/constants';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to User Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Hello, <span className="font-semibold text-blue-600">{user?.full_name}</span>!
          </p>

          <div className={`grid gap-6 mt-12 ${
            user?.role === ROLES.ADMIN 
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' 
              : 'grid-cols-1 max-w-md'
          } mx-auto`}>
            {user?.role === ROLES.ADMIN && (
              <Link 
                to="/admin/dashboard" 
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  User Management
                </h2>
                <p className="text-gray-600">
                  View all users, activate/deactivate accounts
                </p>
              </Link>
            )}
            
            <Link 
              to="/profile" 
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-green-600 text-5xl mb-4">👤</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                My Profile
              </h2>
              <p className="text-gray-600">
                View and edit your profile information
              </p>
            </Link>
          </div>

          <div className="mt-12 bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Your Account Details
            </h3>
            <div className="text-left space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Role:</span>{' '}
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user?.role}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
