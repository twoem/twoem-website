import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { 
  WifiIcon, 
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const WiFiManagement = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    network_name: '',
    password: '',
    connection_guide: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchWiFiCredentials();
  }, []);

  const fetchWiFiCredentials = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/wifi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching WiFi credentials:', error);
      if (error.response?.status === 404) {
        // No WiFi credentials exist yet, that's okay
        setFormData({
          network_name: '',
          password: '',
          connection_guide: `How to Connect to WiFi:

1. **On Windows:**
   - Click on the WiFi icon in the bottom-right corner
   - Select the network name from the list
   - Enter the password when prompted
   - Click "Connect"

2. **On Android:**
   - Go to Settings > WiFi
   - Tap on the network name
   - Enter the password
   - Tap "Connect"

3. **On iPhone/iPad:**
   - Go to Settings > WiFi
   - Tap on the network name
   - Enter the password
   - Tap "Join"

4. **On Mac:**
   - Click the WiFi icon in the menu bar
   - Select the network name
   - Enter the password
   - Click "Join"

**Troubleshooting:**
- Make sure you're in range of the WiFi router
- Check that you've entered the password correctly (it's case-sensitive)
- Try turning WiFi off and on again
- If problems persist, contact the administrator`
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch WiFi credentials' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post(`${BACKEND_URL}/api/admin/wifi`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'WiFi credentials updated successfully!' });
    } catch (error) {
      console.error('Error updating WiFi credentials:', error);
      setMessage({ type: 'error', text: 'Failed to update WiFi credentials' });
    }
    setSaving(false);
  };

  if (loading) {
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
        <div className="flex items-center space-x-3">
          <WifiIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WiFi Settings</h1>
            <p className="text-gray-600 mt-2">Manage WiFi network credentials and connection guide for students</p>
          </div>
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

      {/* WiFi Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">WiFi Network Information</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Network Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Name (SSID)
            </label>
            <input
              type="text"
              value={formData.network_name}
              onChange={(e) => setFormData({...formData, network_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter WiFi network name"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter WiFi password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Connection Guide */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Guide
            </label>
            <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  This guide will be shown to students along with the WiFi credentials. 
                  You can use markdown-style formatting (bold with **text**, line breaks, etc.)
                </p>
              </div>
            </div>
            <textarea
              value={formData.connection_guide}
              onChange={(e) => setFormData({...formData, connection_guide: e.target.value})}
              rows="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Enter step-by-step connection instructions..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Save WiFi Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      {formData.network_name && formData.password && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Student View Preview</h2>
            <p className="text-sm text-gray-600 mt-1">This is how students will see the WiFi information</p>
          </div>
          
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <WifiIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">WiFi Network Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Network Name</label>
                  <p className="text-blue-900 font-mono bg-white px-3 py-2 rounded border">{formData.network_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
                  <p className="text-blue-900 font-mono bg-white px-3 py-2 rounded border">{formData.password}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Connection Guide</h4>
              <div className="text-gray-700 whitespace-pre-wrap text-sm">
                {formData.connection_guide}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WiFiManagement;