import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { userService } from '../services/userService';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import { HiCheck, HiX } from 'react-icons/hi';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page) => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers(page);
      setUsers(data.results);
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (actionType === 'activate') {
        await userService.activateUser(selectedUser.id);
        toast.success(`User ${selectedUser.email} activated successfully`);
      } else {
        await userService.deactivateUser(selectedUser.id);
        toast.success(`User ${selectedUser.email} deactivated successfully`);
      }
      
      // Refresh users list
      await fetchUsers(currentPage);
      setShowModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Action failed';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'ACTIVE';
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const isAdmin = role === 'ADMIN';
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Total Users: {totalCount} | Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {user.status === 'ACTIVE' ? (
                      <Button
                        variant="danger"
                        onClick={() => handleActionClick(user, 'deactivate')}
                        disabled={user.role === 'ADMIN'}
                      >
                        <HiX className="mr-1" /> Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={() => handleActionClick(user, 'activate')}
                      >
                        <HiCheck className="mr-1" /> Activate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow">
              <div className="space-y-2">
                <p className="font-bold text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex space-x-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                <div className="pt-2">
                  {user.status === 'ACTIVE' ? (
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={() => handleActionClick(user, 'deactivate')}
                      disabled={user.role === 'ADMIN'}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      fullWidth
                      onClick={() => handleActionClick(user, 'activate')}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center items-center space-x-4">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !actionLoading && setShowModal(false)}
        title={`Confirm ${actionType === 'activate' ? 'Activation' : 'Deactivation'}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'activate' ? 'success' : 'danger'}
              onClick={handleConfirmAction}
              loading={actionLoading}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to {actionType} user{' '}
          <span className="font-semibold">{selectedUser?.email}</span>?
        </p>
      </Modal>
    </div>
  );
}
