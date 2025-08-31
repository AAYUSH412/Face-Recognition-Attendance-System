import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  CameraIcon, 
  TrashIcon, 
  UserCircleIcon, 
  CheckBadgeIcon, 
  KeyIcon, 
  ArrowUpTrayIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  EnvelopeIcon, 
  IdentificationIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const Profile = () => {
  const { updateUser } = useAuth();
  const [faceData, setFaceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [captureMode, setCaptureMode] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isFaceRegistering, setIsFaceRegistering] = useState(false);
  const [webcamRef, setWebcamRef] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [blazeFaceModel, setBlazeFaceModel] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    registrationId: '',
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [profileErrors, setProfileErrors] = useState({});
  const [userDetails, setUserDetails] = useState(null);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Face registration limits
  const MAX_FACES = 5;

  useEffect(() => {
    // Load face detection models
    const loadModels = async () => {
      try {
        await tf.ready();
        const model = await blazeface.load();
        setBlazeFaceModel(model);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading face detection models:', error);
        toast.error('Failed to load face detection models');
      }
    };

    loadModels();

    // Fetch user's detailed data
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/auth/me');
        const userData = response.data;
        
        setUserDetails(userData);
        setFaceData(userData.faceData || []);
        setProfileForm({
          name: userData.name || '',
          email: userData.email || '',
          registrationId: userData.registrationId || '',
        });

        // Set department info if available
        if (userData.department) {
          setDepartmentInfo(userData.department);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load your profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Setup face detection when camera is active
  useEffect(() => {
    if (!webcamRef || !modelsLoaded || !blazeFaceModel || !captureMode) return;

    const detectFace = async () => {
      if (webcamRef.video.readyState !== 4) return;

      const video = webcamRef.video;
      
      // Detect faces using BlazeFace
      const predictions = await blazeFaceModel.estimateFaces(video);
      
      // Update face detection state
      setIsFaceDetected(predictions.length > 0);
    };

    const interval = setInterval(detectFace, 500);
    return () => clearInterval(interval);
  }, [webcamRef, modelsLoaded, blazeFaceModel, captureMode]);

  const startCameraCapture = () => {
    setCaptureMode(true);
  };

  const cancelCameraCapture = () => {
    setCaptureMode(false);
    setIsFaceDetected(false);
  };

  const registerFace = async () => {
    if (!isFaceDetected) {
      toast.error('No face detected. Please position your face in the frame');
      return;
    }

    if (faceData.length >= MAX_FACES) {
      toast.error(`Maximum of ${MAX_FACES} faces allowed. Please delete an existing face first.`);
      return;
    }

    setIsFaceRegistering(true);
    try {
      const imageSrc = webcamRef.getScreenshot();
      
      const response = await api.post('/api/users/face', {
        base64Image: imageSrc
      });
      
      toast.success('Face registered successfully!');
      setFaceData(response.data.faceData);
      setCaptureMode(false);
      setIsFaceDetected(false);
    } catch (error) {
      console.error('Error registering face:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register face. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsFaceRegistering(false);
    }
  };

  const deleteFace = async (imageId) => {
    try {
      await api.delete(`/api/users/face/${imageId}`);
      setFaceData(faceData.filter(data => data.imageId !== imageId));
      toast.success('Face data removed successfully');
    } catch (error) {
      console.error('Error deleting face data:', error);
      toast.error('Failed to delete face data');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check password match
    if (name === 'confirmPassword' && value !== passwordForm.newPassword) {
      setPasswordErrors(prev => ({ 
        ...prev, 
        confirmPassword: 'Passwords do not match' 
      }));
    } else if (name === 'confirmPassword') {
      setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (!password) return score;
    
    // Length check
    if (password.length >= 8) score++;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) score++;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) score++;
    
    // Contains numbers
    if (/\d/.test(password)) score++;
    
    // Contains special characters
    if (/[^A-Za-z\d]/.test(password)) score++;
    
    // Adjust score to 1-4 scale
    if (score <= 2) return 1;
    if (score === 3) return 2;
    if (score === 4) return 3;
    if (score >= 5) return 4;
    
    return 1;
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setChangingPassword(true);
    try {
      await api.put('/api/users/password', passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('current password')) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.name.trim()) {
      errors.name = 'Name is required';
    } else if (profileForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    setSavingProfile(true);
    try {
      let profileImageData = null;
      
      // Convert image file to base64 if present
      if (fileInputRef.current?.files[0]) {
        const file = fileInputRef.current.files[0];
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error('Image size must be less than 5MB');
          setSavingProfile(false);
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error('Please select a valid image file');
          setSavingProfile(false);
          return;
        }
        
        profileImageData = await convertFileToBase64(file);
      }
      
      const updateData = {
        name: profileForm.name.trim(),
        ...(profileImageData && { profileImageData })
      };
      
      const response = await api.put('/api/users/profile', updateData);
      
      // Update user in context if response contains updated user data
      if (response.data.user) {
        updateUser(response.data.user);
        setUserDetails(response.data.user);
      }
      
      toast.success('Profile updated successfully');
      setEditingProfile(false);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
        {/* Profile Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="profile">Profile Information</option>
              <option value="face">Face Recognition</option>
              <option value="security">Security Settings</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('face')}
                className={`${
                  activeTab === 'face'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Face Recognition
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <KeyIcon className="h-5 w-5 mr-2" />
                Security Settings
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information</p>
            </div>
            {editingProfile ? (
              <button
                onClick={() => {
                  setEditingProfile(false);
                  setPreviewImage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  setProfileForm({
                    name: userDetails?.name || '',
                    email: userDetails?.email || '',
                    registrationId: userDetails?.registrationId || '',
                  });
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setEditingProfile(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </button>
            )}
          </div>
          
          <div className="border-t border-gray-200">
            {editingProfile ? (
              <div className="p-6">
                <form onSubmit={submitProfileUpdate}>
                  <div className="space-y-6">
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg">
                          {previewImage ? (
                            <img src={previewImage} alt="Profile preview" className="h-full w-full object-cover" />
                          ) : userDetails?.profileImage ? (
                            <img src={userDetails.profileImage} alt="Current profile" className="h-full w-full object-cover" />
                          ) : (
                            <UserIcon className="h-full w-full p-6 text-gray-400" />
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0">
                          <label 
                            htmlFor="profile-image" 
                            className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 shadow-lg"
                          >
                            <PhotoIcon className="h-4 w-4" />
                          </label>
                          <input 
                            id="profile-image" 
                            name="profileImage" 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleProfileImage}
                            className="sr-only" 
                            accept="image/*" 
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Click to upload a profile photo (Max 5MB)</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={profileForm.name}
                          onChange={handleProfileChange}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                            profileErrors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {profileErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={profileForm.email}
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email address cannot be changed</p>
                      </div>
                      
                      {userDetails?.registrationId && (
                        <div>
                          <label htmlFor="registrationId" className="block text-sm font-medium text-gray-700">
                            Registration ID
                          </label>
                          <input
                            type="text"
                            name="registrationId"
                            id="registrationId"
                            value={profileForm.registrationId}
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm cursor-not-allowed"
                          />
                          <p className="mt-1 text-xs text-gray-500">Registration ID cannot be changed</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProfile(false);
                          setPreviewImage(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {savingProfile ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <dl>
                <div className="flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 py-8 border-b border-gray-200">
                  <div className="text-center">
                    <div className="h-32 w-32 mx-auto rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
                      {userDetails?.profileImage ? (
                        <img 
                          src={userDetails.profileImage} 
                          alt={userDetails.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <UserCircleIcon className="h-full w-full text-gray-300" />
                      )}
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-gray-900">{userDetails?.name || 'Anonymous User'}</h4>
                    <p className="text-sm text-gray-500 capitalize">{userDetails?.role || 'Student'}</p>
                  </div>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetails?.name || 'Not provided'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetails?.email || 'Not provided'}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CheckBadgeIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                      {userDetails?.role || 'Student'}
                    </span>
                  </dd>
                </div>
                
                {userDetails?.registrationId && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <IdentificationIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Registration ID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                      {userDetails.registrationId}
                    </dd>
                  </div>
                )}
                
                {departmentInfo && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Department
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div>
                        <p className="font-medium">{departmentInfo.name}</p>
                        {departmentInfo.code && (
                          <p className="text-xs text-gray-500">Code: {departmentInfo.code}</p>
                        )}
                      </div>
                    </dd>
                  </div>
                )}
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CameraIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Face recognition
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {faceData.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Enabled ({faceData.length}/{MAX_FACES} faces registered)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Not configured
                      </span>
                    )}
                  </dd>
                </div>
                
                {userDetails?.isActive !== undefined && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Account Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userDetails.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                
                {(userDetails?.createdAt || userDetails?.updatedAt) && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Account Info
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 space-y-1">
                      {userDetails.createdAt && (
                        <p>Created: {new Date(userDetails.createdAt).toLocaleDateString()}</p>
                      )}
                      {userDetails.updatedAt && (
                        <p>Last updated: {new Date(userDetails.updatedAt).toLocaleDateString()}</p>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      )}
      
      {/* Face Recognition Tab */}
      {activeTab === 'face' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Face Recognition Data</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Register your face for contactless attendance</p>
            {faceData.length >= MAX_FACES && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You have reached the maximum limit of {MAX_FACES} face registrations. Please delete an existing face to add a new one.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {captureMode ? (
              <div className="space-y-4">
                <div className="relative">
                  <Webcam
                    audio={false}
                    ref={setWebcamRef}
                    screenshotFormat="image/jpeg"
                    onUserMedia={() => setIsCameraReady(true)}
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    mirrored
                    videoConstraints={{ 
                      facingMode: 'user',
                      width: { ideal: 640 },
                      height: { ideal: 480 }
                    }}
                  />
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                    {isFaceDetected && (
                      <div className="w-48 h-48 border-4 border-green-500 rounded-full animate-pulse opacity-75"></div>
                    )}
                  </div>
                  {!modelsLoaded && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
                        <p className="text-sm">Loading face detection...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={cancelCameraCapture}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={registerFace}
                    disabled={!isFaceDetected || isFaceRegistering || !modelsLoaded}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      (!isFaceDetected || isFaceRegistering || !modelsLoaded) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isFaceRegistering ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registering...
                      </>
                    ) : (
                      <>
                        <CameraIcon className="h-4 w-4 mr-1" />
                        Register Face
                      </>
                    )}
                  </button>
                </div>
                
                <div className="text-sm text-center">
                  {!modelsLoaded ? (
                    <p className="text-gray-500">Loading face detection models...</p>
                  ) : !isCameraReady ? (
                    <p className="text-gray-500">Camera loading...</p>
                  ) : isFaceDetected ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      Face detected! Click "Register Face" to save.
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-orange-600">
                      <InformationCircleIcon className="h-5 w-5 mr-1" />
                      No face detected. Please position your face in the frame.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <button
                    onClick={startCameraCapture}
                    disabled={faceData.length >= MAX_FACES}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      faceData.length >= MAX_FACES ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <CameraIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Register New Face
                  </button>
                  {faceData.length >= MAX_FACES && (
                    <p className="mt-2 text-sm text-gray-500">Maximum faces reached</p>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                    Face Registration Guidelines:
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-blue-800">
                    <li>Ensure your face is well-lit and clearly visible</li>
                    <li>Remove glasses, masks, or other face coverings</li>
                    <li>Look directly at the camera for best results</li>
                    <li>Register different angles for improved recognition</li>
                    <li>Maximum {MAX_FACES} face images allowed per user</li>
                    <li>Each registration improves attendance accuracy</li>
                  </ul>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading face data...</p>
                  </div>
                ) : faceData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        Registered Faces ({faceData.length}/{MAX_FACES})
                      </h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                        Ready for attendance
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {faceData.map((face, index) => (
                        <div key={face.imageId} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                          <div className="aspect-w-1 aspect-h-1">
                            <img 
                              src={face.imageUrl} 
                              alt={`Registered face ${index + 1}`} 
                              className="w-full h-48 object-cover"
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => deleteFace(face.imageId)}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              title="Delete this face data"
                            >
                              <TrashIcon className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-600 font-medium">
                                Face #{index + 1}
                              </p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Registered {new Date(face.createdAt).toLocaleDateString()} at {new Date(face.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-sm font-medium text-gray-900">No face data registered</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                      Get started by registering your face for contactless attendance. This ensures accurate identification during events.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={startCameraCapture}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <CameraIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Register Your First Face
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account security and password</p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6 space-y-8">
              
              {/* Password Change Section */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Change Password
                </h4>
                
                <div className="max-w-xl">
                  <form onSubmit={submitPasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password *
                      </label>
                      <div className="mt-1 relative">
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className={`appearance-none block w-full px-3 py-2 border ${
                            passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10`}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-2 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password *
                      </label>
                      <div className="mt-1 relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className={`appearance-none block w-full px-3 py-2 border ${
                            passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10`}
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}
                      {/* Password strength indicator */}
                      {passwordForm.newPassword && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">Password strength:</div>
                          <div className="flex space-x-1">
                            {[...Array(4)].map((_, index) => {
                              const strength = getPasswordStrength(passwordForm.newPassword);
                              return (
                                <div
                                  key={index}
                                  className={`h-2 w-1/4 rounded ${
                                    index < strength
                                      ? strength === 1
                                        ? 'bg-red-400'
                                        : strength === 2
                                        ? 'bg-yellow-400'
                                        : strength === 3
                                        ? 'bg-blue-400'
                                        : 'bg-green-400'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <div className="text-xs mt-1">
                            {getPasswordStrength(passwordForm.newPassword) === 1 && (
                              <span className="text-red-600">Weak</span>
                            )}
                            {getPasswordStrength(passwordForm.newPassword) === 2 && (
                              <span className="text-yellow-600">Fair</span>
                            )}
                            {getPasswordStrength(passwordForm.newPassword) === 3 && (
                              <span className="text-blue-600">Good</span>
                            )}
                            {getPasswordStrength(passwordForm.newPassword) === 4 && (
                              <span className="text-green-600">Strong</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password *
                      </label>
                      <div className="mt-1 relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className={`appearance-none block w-full px-3 py-2 border ${
                            passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10`}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                      {/* Password match indicator */}
                      {passwordForm.confirmPassword && passwordForm.newPassword && (
                        <div className="mt-2">
                          {passwordForm.newPassword === passwordForm.confirmPassword ? (
                            <div className="flex items-center text-green-600 text-xs">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Passwords match
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600 text-xs">
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Passwords do not match
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {changingPassword ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <KeyIcon className="h-4 w-4 mr-1" />
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Password Security Guidelines</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use at least 8 characters with a mix of letters, numbers, and symbols</li>
                        <li>Avoid common words, personal information, or easily guessable patterns</li>
                        <li>Don't reuse passwords from other accounts</li>
                        <li>Consider using a password manager for generating and storing secure passwords</li>
                        <li>Change your password immediately if you suspect it has been compromised</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security Status */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Security Status
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Account Active</p>
                        <p className="text-xs text-gray-500">Your account is active and secure</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {faceData.length > 0 ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">Face Recognition</p>
                        <p className="text-xs text-gray-500">
                          {faceData.length > 0 
                            ? `${faceData.length} face(s) registered for secure attendance`
                            : 'No faces registered - add face recognition for enhanced security'
                          }
                        </p>
                      </div>
                    </div>
                    {faceData.length === 0 && (
                      <button
                        onClick={() => setActiveTab('face')}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Set up
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;