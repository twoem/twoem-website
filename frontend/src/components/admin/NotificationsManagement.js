import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon, 
  BellIcon, 
  TrashIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NotificationsManagement = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    target_student_ids: '',
    priority: 'normal'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchNotifications();
    fetchStudents();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setMessage({ type: 'error', text: 'Failed to fetch notifications' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('target_audience', formData.target_audience);
      formDataToSend.append('target_student_ids', formData.target_student_ids);
      formDataToSend.append('priority', formData.priority);
      
      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      await axios.post(`${BACKEND_URL}/api/admin/notifications`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Notification created successfully!' });
      setFormData({
        title: '',
        content: '',
        target_audience: 'all',
        target_student_ids: '',
        priority: 'normal'
      });
      setSelectedFile(null);
      setShowCreateModal(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      setMessage({ type: 'error', text: 'Failed to create notification' });
    }
    setLoading(false);
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/admin/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Notification deleted successfully!' });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setMessage({ type: 'error', text: 'Failed to delete notification' });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <ExclamationCircleIcon className="h-4 w-4" />;
      case 'high': return <ExclamationCircleIcon className="h-4 w-4" />;
      default: return <BellIcon className="h-4 w-4" />;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications Management</h1>
            <p className="text-gray-600 mt-2">Send notifications and announcements to students</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Notification</span>
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? 
            <CheckCircleIcon className="h-5 w-5" /> : 
            <ExclamationCircleIcon className="h-5 w-5" />
          }
          <span>{message.text}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">Create your first notification to get started.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                      {getPriorityIcon(notification.priority)}
                      <span className="capitalize">{notification.priority}</span>
                    </span>
                    {notification.has_attachment && (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        <PaperClipIcon className="h-3 w-3" />
                        <span>Attachment</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{notification.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Target: <span className="font-medium capitalize">{notification.target_audience}</span></span>
                    <span>•</span>
                    <span>Created: {new Date(notification.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete notification"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New Notification</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Students</option>
                    <option value="specific">Specific Students</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {formData.target_audience === 'specific' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student IDs (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.target_student_ids}
                    onChange={(e) => setFormData({...formData, target_student_ids: e.target.value})}
                    placeholder="student1-id, student2-id, ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;