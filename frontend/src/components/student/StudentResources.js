import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellIcon, 
  BookOpenIcon, 
  WifiIcon,
  DocumentArrowDownIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StudentResources = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [wifiCredentials, setWifiCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchNotifications(),
        fetchResources(),
        fetchDownloads(),
        fetchWifiCredentials()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/student/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/student/resources`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchDownloads = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/student/downloads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDownloads(response.data);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    }
  };

  const fetchWifiCredentials = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/student/wifi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWifiCredentials(response.data);
    } catch (error) {
      console.error('Error fetching WiFi credentials:', error);
    }
  };

  const downloadNotificationAttachment = async (notificationId, filename) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/student/notifications/${notificationId}/attachment`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setMessage({ type: 'error', text: 'Failed to download attachment' });
    }
  };

  const downloadResource = async (resourceId, filename) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/student/resources/${resourceId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resource:', error);
      setMessage({ type: 'error', text: 'Failed to download resource' });
    }
  };

  const downloadPublicFile = async (downloadId, filename) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/downloads/${downloadId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setMessage({ type: 'error', text: 'Failed to download file' });
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

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: BellIcon, count: notifications.length },
    { id: 'resources', name: 'Study Materials', icon: BookOpenIcon, count: resources.length },
    { id: 'downloads', name: 'Downloads', icon: DocumentArrowDownIcon, count: downloads.length },
    { id: 'wifi', name: 'WiFi Access', icon: WifiIcon, count: null }
  ];

  if (loading) {
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
        <h1 className="text-3xl font-bold text-gray-900">Student Resources</h1>
        <p className="text-gray-600 mt-2">Access notifications, study materials, and WiFi information</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
                {tab.count !== null && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You'll see important announcements here when they're posted.</p>
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
                      <p className="text-gray-600 mb-3 whitespace-pre-wrap">{notification.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Posted: {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {notification.has_attachment && (
                          <button
                            onClick={() => downloadNotificationAttachment(notification.id, notification.attachment_filename)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            <span>Download Attachment</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {Object.keys(groupedResources).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No study materials</h3>
                <p className="text-gray-500">PDF notes and resources will appear here when uploaded by your instructor.</p>
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
                              <DocumentArrowDownIcon className="h-5 w-5 text-blue-600" />
                              <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                            </div>
                            {resource.description && (
                              <p className="text-gray-600 mb-3">{resource.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Uploaded: {new Date(resource.uploaded_at).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() => downloadResource(resource.id, resource.filename)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
                              >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                <span>Download PDF</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div className="space-y-4">
            {downloads.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <DocumentArrowDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads available</h3>
                <p className="text-gray-500">Downloadable files will appear here when made available.</p>
              </div>
            ) : (
              downloads.map((download) => (
                <div key={download.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <DocumentArrowDownIcon className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{download.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          download.file_type === 'private' 
                            ? 'bg-red-100 text-red-800 border-red-200' 
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {download.file_type === 'private' && <LockClosedIcon className="h-3 w-3 mr-1" />}
                          {download.file_type === 'private' ? 'Private' : 'Public'}
                        </span>
                      </div>
                      {download.description && (
                        <p className="text-gray-600 mb-3">{download.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>File: <span className="font-medium">{download.filename}</span></span>
                          <span>•</span>
                          <span>Downloads: {download.download_count}</span>
                        </div>
                        {download.file_type === 'public' ? (
                          <button
                            onClick={() => downloadPublicFile(download.id, download.filename)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 text-red-600">
                            <LockClosedIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">Admin Only</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* WiFi Tab */}
        {activeTab === 'wifi' && (
          <div className="space-y-6">
            {!wifiCredentials ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <WifiIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">WiFi information not available</h3>
                <p className="text-gray-500">WiFi credentials will be displayed here when configured by the administrator.</p>
              </div>
            ) : (
              <>
                {/* WiFi Credentials */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <WifiIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-blue-900">WiFi Network Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Network Name</label>
                      <div className="bg-white px-4 py-3 rounded-lg border border-blue-200">
                        <p className="text-blue-900 font-mono text-lg">{wifiCredentials.network_name}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-2">Password</label>
                      <div className="bg-white px-4 py-3 rounded-lg border border-blue-200 flex items-center justify-between">
                        <p className="text-blue-900 font-mono text-lg">
                          {showWifiPassword ? wifiCredentials.password : '••••••••••••'}
                        </p>
                        <button
                          onClick={() => setShowWifiPassword(!showWifiPassword)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          {showWifiPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Guide */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <InformationCircleIcon className="h-6 w-6 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">How to Connect</h2>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {wifiCredentials.connection_guide}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResources;