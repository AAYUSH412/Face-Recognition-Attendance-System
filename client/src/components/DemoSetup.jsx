import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  PlayCircleIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const DemoSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [demoData, setDemoData] = useState(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const setupDemo = async () => {
    setIsSettingUp(true);
    try {
      const response = await axios.post('/api/demo/setup');
      setDemoData(response.data);
      toast.success('Demo data created successfully!');
    } catch (error) {
      console.error('Error setting up demo:', error);
      toast.error(error.response?.data?.message || 'Failed to setup demo data');
    } finally {
      setIsSettingUp(false);
    }
  };

  const cleanupDemo = async () => {
    setIsCleaningUp(true);
    try {
      await axios.delete('/api/demo/cleanup');
      setDemoData(null);
      toast.success('Demo data cleaned up successfully!');
    } catch (error) {
      console.error('Error cleaning up demo:', error);
      toast.error(error.response?.data?.message || 'Failed to cleanup demo data');
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Face Recognition Attendance System - Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This is a simplified demonstration version of the complete Face Recognition Attendance System. 
            The full version includes advanced features like face recognition, real-time analytics, and more.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Demo Version Features</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>Manual attendance marking (instead of face recognition)</li>
                <li>Basic user management and authentication</li>
                <li>Simple attendance tracking and history</li>
                <li>Event management system</li>
                <li>Dashboard with attendance statistics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Setup Section */}
        {!demoData ? (
          <div className="bg-white shadow rounded-lg p-8 mb-8">
            <div className="text-center">
              <PlayCircleIcon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Demo Data</h2>
              <p className="text-gray-600 mb-6">
                Click the button below to create sample users, departments, and events for the demonstration.
              </p>
              <button
                onClick={setupDemo}
                disabled={isSettingUp}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {isSettingUp ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Setting up...</span>
                  </div>
                ) : (
                  'Setup Demo Data'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Demo Setup Complete!</h3>
                  <p className="text-green-700">
                    Sample data has been created. You can now log in with any of the accounts below to explore the system.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Admin */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <UserGroupIcon className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Administrator</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{demoData.credentials.admin.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Password:</span>
                    <p className="text-gray-600">{demoData.credentials.admin.password}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Full system access, user management, reports
                </p>
              </div>

              {/* Faculty */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Faculty</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{demoData.credentials.faculty.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Password:</span>
                    <p className="text-gray-600">{demoData.credentials.faculty.password}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Class management, attendance monitoring
                </p>
              </div>

              {/* Students */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Students</h3>
                </div>
                <div className="space-y-3 text-sm">
                  {demoData.credentials.students.map((student, index) => (
                    <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-600">{student.email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Password:</span>
                        <p className="text-gray-600">{student.password}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Attendance marking, history viewing
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
              >
                Go to Login
              </Link>
              <button
                onClick={cleanupDemo}
                disabled={isCleaningUp}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {isCleaningUp ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Cleaning up...</span>
                  </div>
                ) : (
                  'Reset Demo Data'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mt-12 bg-white shadow rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Demo vs Full Version</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-yellow-800 mb-4">Demo Version (Current)</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Manual attendance marking
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Basic user authentication
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Simple attendance history
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Event management
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Basic dashboard
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-800 mb-4">Full Version</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Face recognition attendance
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  QR code backup system
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Real-time notifications
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Comprehensive reporting
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Mobile app integration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSetup;
