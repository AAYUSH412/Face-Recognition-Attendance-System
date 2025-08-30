import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import {
  QrCodeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const QRCodeScanner = ({ 
  onScanSuccess: onScanSuccessCallback,
  disabled = false,
  autoRetry = true,
  maxRetries = 3,
  retryDelay = 2000
}) => {
  const [scanning, setScanning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [error, setError] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' or 'user'
  const [retryCount, setRetryCount] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState('unknown'); // 'granted', 'denied', 'unknown'
  
  const scannerRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const initTimeoutRef = useRef(null);

  // Check camera permissions
  const checkCameraPermissions = useCallback(async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'camera' });
        setPermissionStatus(result.state);
        return result.state === 'granted';
      }
      
      // Fallback: try to access camera directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionStatus('granted');
        return true;
      } catch {
        setPermissionStatus('denied');
        return false;
      }
    } catch {
      setPermissionStatus('unknown');
      return false;
    }
  }, []);

  useEffect(() => {
    // Clean up when component unmounts or when scanning state changes to false
    return () => {
      // Clear timeouts
      const retryTimeout = retryTimeoutRef.current;
      const initTimeout = initTimeoutRef.current;
      
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      
      // Stop scanner
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [html5QrCode]);

  // Handle scanner errors with different strategies
  const handleScannerError = useCallback((err) => {
    console.error('Scanner error:', err);
    setInitializing(false);
    setScanning(false);
    
    if (err.name === 'NotAllowedError' || err.message.includes('Permission')) {
      setError({
        type: 'permission',
        message: 'Camera permission denied. Please enable camera access and try again.'
      });
      setPermissionStatus('denied');
    } else if (err.name === 'NotFoundError' || err.message.includes('No cameras')) {
      setError({
        type: 'hardware',
        message: 'No camera found. Please check if your device has a camera.'
      });
    } else if (err.name === 'NotReadableError') {
      setError({
        type: 'hardware',
        message: 'Camera is already in use by another application.'
      });
    } else if (autoRetry && retryCount < maxRetries) {
      setError({
        type: 'retry',
        message: `Connection failed. Retrying... (${retryCount + 1}/${maxRetries})`
      });
      
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Call startScanner indirectly to avoid circular dependency
        setInitializing(true);
      }, retryDelay);
    } else {
      setError({
        type: 'general',
        message: 'Failed to start camera. Please try again or check your camera settings.'
      });
    }
  }, [autoRetry, retryCount, maxRetries, retryDelay]);

  const processQrCode = useCallback(async (qrData) => {
    setProcessing(true);
    setError(null);
    
    try {
      const response = await api.post('/api/events/verify-attendance', { 
        qrCodeData: qrData 
      });
      
      toast.success(response.data.message);
      setEventDetails(response.data.event || response.data);
      
      // Call the callback if provided
      if (onScanSuccessCallback) {
        onScanSuccessCallback(response.data);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process QR code';
      toast.error(errorMessage);
      
      setError({
        type: 'api',
        message: errorMessage
      });
      setScanResult(null);
    } finally {
      setProcessing(false);
    }
  }, [onScanSuccessCallback]);

  const onScanSuccess = useCallback(async (decodedText) => {
    // Stop scanning once we get a result
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop();
      } catch (err) {
        console.error('Error stopping scanner after success:', err);
      }
    }
    setScanning(false);
    setScanResult(decodedText);
    processQrCode(decodedText);
  }, [html5QrCode, processQrCode]);

  const onScanFailure = useCallback((error) => {
    // Only log verbose errors in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.warn('QR code scan error:', error);
    }
  }, []);

  // Reset states for new scan
  const resetStates = useCallback(() => {
    setScanResult(null);
    setEventDetails(null);
    setError(null);
    setRetryCount(0);
  }, []);

  // Effect to handle retries
  useEffect(() => {
    if (error?.type === 'retry' && initializing) {
      const timer = setTimeout(async () => {
        try {
          const hasPermission = await checkCameraPermissions();
          if (hasPermission) {
            // Wait for the reader element to be available
            const waitForElement = (id, maxWait = 5000) => {
              return new Promise((resolve, reject) => {
                const checkInterval = 100;
                let totalWaited = 0;
                
                const checkElement = () => {
                  const element = document.getElementById(id);
                  if (element) {
                    resolve(element);
                  } else if (totalWaited >= maxWait) {
                    reject(new Error(`Element with id "${id}" not found after ${maxWait}ms`));
                  } else {
                    totalWaited += checkInterval;
                    setTimeout(checkElement, checkInterval);
                  }
                };
                
                checkElement();
              });
            };

            // Wait for the reader element
            await waitForElement('reader');
            
            const qrCodeScanner = new Html5Qrcode('reader');
            setHtml5QrCode(qrCodeScanner);
            
            const config = { 
              fps: 10, 
              qrbox: { width: 280, height: 280 },
              aspectRatio: 1.0,
              disableFlip: false
            };
        
            await qrCodeScanner.start(
              { facingMode: cameraFacing },
              config,
              onScanSuccess,
              onScanFailure
            );
            
            setScanning(true);
            setInitializing(false);
          }
        } catch (error) {
          handleScannerError(error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initializing, error, cameraFacing, onScanSuccess, onScanFailure, checkCameraPermissions, handleScannerError]);

  const startScanner = useCallback(async () => {
    if (disabled) return;
    
    setInitializing(true);
    setError(null);
    resetStates();

    // Check camera permissions first
    const hasPermission = await checkCameraPermissions();
    if (!hasPermission) {
      setError({
        type: 'permission',
        message: 'Camera permission denied. Please enable camera access in your browser settings.'
      });
      setInitializing(false);
      return;
    }

    // Add a small delay to ensure DOM element exists and wait for it
    initTimeoutRef.current = setTimeout(async () => {
      try {
        // Wait for the reader element to be available
        const waitForElement = (id, maxWait = 5000) => {
          return new Promise((resolve, reject) => {
            const checkInterval = 100;
            let totalWaited = 0;
            
            const checkElement = () => {
              const element = document.getElementById(id);
              if (element) {
                resolve(element);
              } else if (totalWaited >= maxWait) {
                reject(new Error(`Element with id "${id}" not found after ${maxWait}ms`));
              } else {
                totalWaited += checkInterval;
                setTimeout(checkElement, checkInterval);
              }
            };
            
            checkElement();
          });
        };

        // Wait for the reader element
        await waitForElement('reader');
        
        const qrCodeScanner = new Html5Qrcode('reader');
        setHtml5QrCode(qrCodeScanner);
        scannerRef.current = qrCodeScanner;
        
        const config = { 
          fps: 10, 
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
          disableFlip: false
        };
    
        await qrCodeScanner.start(
          { facingMode: cameraFacing },
          config,
          onScanSuccess,
          onScanFailure
        );
        
        setScanning(true);
        setInitializing(false);
      } catch (err) {
        console.error('Scanner start error:', err);
        handleScannerError(err);
      }
    }, 100);
  }, [disabled, cameraFacing, checkCameraPermissions, resetStates, handleScannerError, onScanSuccess, onScanFailure]);

  const stopScanner = useCallback(async () => {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop();
        setScanning(false);
        setInitializing(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
        setScanning(false);
        setInitializing(false);
      }
    } else {
      setScanning(false);
      setInitializing(false);
    }
  }, [html5QrCode]);

  const switchCamera = useCallback(async () => {
    if (scanning) {
      await stopScanner();
    }
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
    setTimeout(() => {
      setInitializing(true);
    }, 500);
  }, [scanning, stopScanner]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString(undefined, options);
  };

  const renderError = () => {
    if (!error) return null;

    const errorConfig = {
      permission: {
        icon: ExclamationCircleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-100',
        iconColor: 'text-red-400',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        buttonBg: 'bg-red-100',
        buttonHover: 'hover:bg-red-200',
        buttonText: 'text-red-700',
        title: 'Camera Permission Required'
      },
      hardware: {
        icon: CameraIcon,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-100',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        buttonBg: 'bg-yellow-100',
        buttonHover: 'hover:bg-yellow-200',
        buttonText: 'text-yellow-700',
        title: 'Hardware Issue'
      },
      retry: {
        icon: ArrowPathIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-100',
        iconColor: 'text-blue-400',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
        buttonBg: 'bg-blue-100',
        buttonHover: 'hover:bg-blue-200',
        buttonText: 'text-blue-700',
        title: 'Retrying Connection'
      },
      api: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-100',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        buttonBg: 'bg-yellow-100',
        buttonHover: 'hover:bg-yellow-200',
        buttonText: 'text-yellow-700',
        title: 'Processing Error'
      },
      general: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-100',
        iconColor: 'text-gray-400',
        titleColor: 'text-gray-800',
        textColor: 'text-gray-700',
        buttonBg: 'bg-gray-100',
        buttonHover: 'hover:bg-gray-200',
        buttonText: 'text-gray-700',
        title: 'Scanner Error'
      }
    };

    const config = errorConfig[error.type] || errorConfig.general;
    const Icon = config.icon;

    return (
      <div className={`mt-4 p-4 ${config.bgColor} rounded-md border ${config.borderColor}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${config.titleColor}`}>{config.title}</h3>
            <p className={`mt-1 text-sm ${config.textColor}`}>{error.message}</p>
            {(error.type === 'permission' || error.type === 'api' || error.type === 'general') && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={startScanner}
                  disabled={disabled || initializing}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${config.buttonText} ${config.buttonBg} ${config.buttonHover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <QrCodeIcon className="h-5 w-5 mr-2 text-indigo-500" />
          QR Code Scanner
        </h3>
        {(scanning || initializing) && (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={switchCamera}
              disabled={initializing}
              className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              title="Switch Camera"
            >
              <CameraIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={stopScanner}
              disabled={initializing}
              className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {!scanning && !scanResult && !initializing && !error && (
          <div className="text-center">
            <QrCodeIcon className="mx-auto h-12 w-12 text-indigo-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No QR code scanned yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Scan a QR code to mark your attendance for an event
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={startScanner}
                disabled={disabled}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <QrCodeIcon className="-ml-1 mr-2 h-5 w-5" />
                Start Scanning
              </button>
            </div>
          </div>
        )}

        {initializing && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm font-medium text-gray-700">Initializing camera...</p>
            <p className="mt-1 text-xs text-gray-500">
              {permissionStatus === 'unknown' ? 'Checking camera permissions...' : 'Starting camera...'}
            </p>
          </div>
        )}

{(scanning || initializing) && (
          <div className="text-center">
            <div id="reader" className="mx-auto" style={{ width: '100%', maxWidth: '500px' }}></div>
            {scanning && (
              <>
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Switch Camera"
                  >
                    <CameraIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Switch Camera
                  </button>
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Cancel
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Position the QR code within the square</p>
                <p className="text-xs text-gray-400">Camera: {cameraFacing === 'environment' ? 'Back' : 'Front'}</p>
              </>
            )}
          </div>
        )}

        {processing && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm font-medium text-gray-700">Processing QR code...</p>
            <p className="mt-1 text-xs text-gray-500">Please wait while we verify your attendance</p>
          </div>
        )}

        {eventDetails && (
          <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Attendance marked successfully!</h3>
                <div className="mt-4 text-sm text-green-700">
                  <div className="space-y-2">
                    <p><span className="font-medium">Event:</span> {eventDetails.name}</p>
                    <p><span className="font-medium">Date:</span> {formatDateTime(eventDetails.startDate)}</p>
                    <p><span className="font-medium">Location:</span> {eventDetails.location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEventDetails(null);
                      setScanResult(null);
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Scan Another QR Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {renderError()}
      </div>
    </div>
  );
};

export default QRCodeScanner;