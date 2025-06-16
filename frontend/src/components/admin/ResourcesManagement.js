import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusIcon, 
  BookOpenIcon, 
  TrashIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ResourcesManagement = () => {
  const { token } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [subjects, setSubjects] = useState([]);

  // Common subjects for categorization
  const commonSubjects = [
    'Computer Introduction',
    'MS Word',
    'MS Excel', 
    'MS PowerPoint',
    'MS Access',
    'Programming',
    'Digital Literacy',
    'Internet & Email',
    'Graphics Design',
    'General Knowledge'
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    // Extract unique subjects from existing resources
    const uniqueSubjects = [...new Set(resources.map(r => r.subject))];
    setSubjects([...new Set([...commonSubjects, ...uniqueSubjects])]);
  }, [resources]);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setMessage({ type: 'error', text: 'Failed to fetch resources' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a PDF file' });
      setLoading(false);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ type: 'error', text: 'Only PDF files are allowed' });
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('file', selectedFile);

      await axios.post(`${BACKEND_URL}/api/admin/resources`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Resource uploaded successfully!' });
      setFormData({
        title: '',
        description: '',
        subject: ''
      });
      setSelectedFile(null);
      setShowCreateModal(false);
      fetchResources();
    } catch (error) {
      console.error('Error uploading resource:', error);
      setMessage({ type: 'error', text: 'Failed to upload resource' });
    }
    setLoading(false);
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/admin/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Resource deleted successfully!' });
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      setMessage({ type: 'error', text: 'Failed to delete resource' });
    }
  };

  const groupResourcesBySubject = () => {
    const grouped = {};
    resources.forEach(resource => {
      if (!grouped[resource.subject]) {
        grouped[resource.subject] = [];
      }
      grouped[resource.subject].push(resource);
    });
    return grouped;
  };

  const getSubjectColor = (subject) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-teal-100 text-teal-800 border-teal-200'
    ];
    const index = subject.length % colors.length;
    return colors[index];
  };

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedResources = groupResourcesBySubject();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Resources</h1>
            <p className="text-gray-600 mt-2">Manage PDF notes and study materials by subject</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Upload Resource</span>
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

      {/* Resources by Subject */}
      <div className="space-y-8">
        {Object.keys(groupedResources).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
            <p className="text-gray-500">Upload your first PDF resource to get started.</p>
          </div>
        ) : (
          Object.entries(groupedResources).map(([subject, subjectResources]) => (
            <div key={subject} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <TagIcon className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">{subject}</h2>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSubjectColor(subject)}`}>
                    {subjectResources.length} {subjectResources.length === 1 ? 'resource' : 'resources'}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {subjectResources.map((resource) => (
                  <div key={resource.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <DocumentIcon className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                        </div>
                        {resource.description && (
                          <p className="text-gray-600 mb-3">{resource.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>File: <span className="font-medium">{resource.filename}</span></span>
                          <span>•</span>
                          <span>Uploaded: {new Date(resource.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete resource"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-lg bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload New Resource</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Or type a new subject name in the field above</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Only PDF files are allowed</p>
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
                  {loading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesManagement;