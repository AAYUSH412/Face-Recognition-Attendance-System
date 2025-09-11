import React, { useState, useEffect,useRef,useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as blazeface from '@tensorflow-models/blazeface';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const AttendanceCapture = () => {
  const navigate = useNavigate();
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceDetectionConfidence, setFaceDetectionConfidence] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [blazeFaceModel, setBlazeFaceModel] = useState(null);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [activeMode, setActiveMode] = useState('selection'); // 'selection', 'qr', 'manual' (removed 'face')
  const [captureType, setCaptureType] = useState("check-in");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [qrError, setQrError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const MIN_CONFIDENCE_THRESHOLD = 0.5;

  // Custom toast components with icons
  const showSuccessToast = (message, isCheckout = false) => {
    toast.success(
      () => (
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 ${isCheckout ? 'text-red-500' : 'text-green-500'}`}>
            {isCheckout ? (
              <XCircleIcon className="w-6 h-6" />
            ) : (
              <CheckCircleIcon className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{message}</p>
            <p className="text-sm text-gray-600 mt-1">
              {isCheckout ? '🏁 Your work day has ended successfully' : '✨ Your work day has started successfully'}
            </p>
          </div>
        </div>
      ),
      {
        duration: 5000,
        style: {
          background: isCheckout ? '#FEF2F2' : '#F0FDF4',
          border: `2px solid ${isCheckout ? '#F87171' : '#34D399'}`,
          padding: '16px',
          borderRadius: '12px',
          maxWidth: '450px',
          fontSize: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }
    );
  };

  const showErrorToast = (message) => {
    toast.error(
      () => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-red-500">
            <XCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Attendance Failed</p>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
      ),
      {
        duration: 6000,
        style: {
          background: '#FEF2F2',
          border: '2px solid #F87171',
          padding: '16px',
          borderRadius: '12px',
          maxWidth: '450px',
          fontSize: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }
    );
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Face recognition related code - commented out for now
  // Load TensorFlow models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading TensorFlow.js models...');
        await tf.ready();
        const model = await blazeface.load();
        setBlazeFaceModel(model);
        setModelsLoaded(true);
        console.log('BlazeFace model loaded successfully');
      } catch (error) {
        console.error('Error loading models:', error);
      }
    };

    loadModels();
  }, []);

  // Face detection function
  const detectFaces = useCallback(async () => {
    if (
      blazeFaceModel &&
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const predictions = await blazeFaceModel.estimateFaces(video, false);

      if (predictions.length > 0) {
        const confidence = predictions[0].probability[0];
        setIsFaceDetected(true);
        setFaceDetectionConfidence(confidence);
        
        // Draw face detection box
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = confidence > MIN_CONFIDENCE_THRESHOLD ? '#00ff00' : '#ff0000';
          ctx.lineWidth = 2;
          
          const [x, y] = predictions[0].topLeft;
          const [width, height] = predictions[0].bottomRight.map((coord, i) => coord - predictions[0].topLeft[i]);
          ctx.strokeRect(x, y, width, height);
        }
      } else {
        setIsFaceDetected(false);
        setFaceDetectionConfidence(0);
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  }, [blazeFaceModel]);

  // Face detection loop
  useEffect(() => {
    let interval;
    if (activeMode === 'face' && modelsLoaded) {
      interval = setInterval(detectFaces, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMode, modelsLoaded, blazeFaceModel, detectFaces]);

  // Handle face recognition attendance
  const captureAttendance = async () => {
    if (!webcamRef.current || !isFaceDetected || faceDetectionConfidence < MIN_CONFIDENCE_THRESHOLD) {
      showErrorToast('Please ensure your face is clearly visible and detected');
      return;
    }

    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      const response = await api.post('/api/attendance/mark', {
        type: captureType,
        base64Image: imageSrc,
        confidence: faceDetectionConfidence,
        method: 'face_recognition',
        location: 'Frontend Camera',
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        setCurrentAttendance(response.data.attendance);
        setShowSuccessMessage(true);
        const isCheckout = captureType === 'check-out';
        showSuccessToast(`Face ${captureType === 'check-in' ? 'Check-in' : 'Check-out'} successful!`, isCheckout);
        // Don't auto-redirect - stay in face mode for multiple captures
      } else {
        showErrorToast(response.data.message || 'Face attendance marking failed');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      showErrorToast(error.response?.data?.message || error.message || 'Error marking attendance');
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle manual attendance
  const markManualAttendance = async () => {
    setIsCapturing(true);
    try {
      const response = await api.post('/api/attendance/mark-manual', {
        type: captureType,
        timestamp: new Date().toISOString(),
        method: 'manual'
      });

      if (response.data.success) {
        setCurrentAttendance(response.data.attendance);
        setShowSuccessMessage(true);
        const isCheckout = captureType === 'check-out';
        showSuccessToast(`Manual ${captureType === 'check-in' ? 'Check-in' : 'Check-out'} successful!`, isCheckout);
        // Don't auto-redirect - stay in manual mode
      } else {
        showErrorToast(response.data.message || 'Manual attendance marking failed');
      }
    } catch (error) {
      console.error('Error marking manual attendance:', error);
      showErrorToast(error.response?.data?.message || error.message || 'Error marking manual attendance');
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle QR code scanning
  const startQRScanning = async () => {
    try {
      setActiveMode('qr');
      setQrError(null);
      
      // Clear any existing scanner first
      if (html5QrCode) {
        await html5QrCode.clear();
        setHtml5QrCode(null);
      }
      
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            }
          },
          false
        );

        scanner.render(
          async (decodedText) => {
            try {
              console.log('QR Code detected:', decodedText);
              
              // Stop the scanner
              await scanner.clear();
              setHtml5QrCode(null);
              
              // Mark attendance with QR code
              const response = await api.post('/api/attendance/mark', {
                type: captureType,
                qrCode: decodedText,
                method: 'qr_code',
                confidence: 100,
                location: 'QR Code Scanner',
                timestamp: new Date().toISOString()
              });

              if (response.data.success) {
                setCurrentAttendance(response.data.attendance);
                setShowSuccessMessage(true);
                const isCheckout = captureType === 'check-out';
                showSuccessToast(`QR ${captureType === 'check-in' ? 'Check-in' : 'Check-out'} successful!`, isCheckout);
                // Don't auto-redirect - stay in QR mode for multiple scans
              } else {
                showErrorToast(response.data.message || 'QR attendance marking failed');
              }
            } catch (error) {
              console.error('Error processing QR code:', error);
              showErrorToast(error.response?.data?.message || error.message || 'Error processing QR code');
            }
          },
          (errorMessage) => {
            // Only show errors that are not common scanning messages
            if (!errorMessage.includes('No QR code found') && 
                !errorMessage.includes('QR code parse error') &&
                !errorMessage.includes('NotFoundException')) {
              console.log('QR Scan error:', errorMessage);
              setQrError(errorMessage);
            }
          }
        );

        setHtml5QrCode(scanner);
      }, 100);
      
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      setQrError('Failed to start QR scanner: ' + error.message);
      showErrorToast('Failed to start QR scanner: ' + error.message);
    }
  };

  // Stop QR scanning
  const stopQRScanning = async () => {
    try {
      if (html5QrCode) {
        await html5QrCode.clear();
        setHtml5QrCode(null);
      }
      setQrError(null);
      setActiveMode('selection');
    } catch (error) {
      console.error('Error stopping QR scanner:', error);
      // Force clear the scanner element
      const qrElement = document.getElementById('qr-reader');
      if (qrElement) {
        qrElement.innerHTML = '';
      }
      setHtml5QrCode(null);
      setActiveMode('selection');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCode) {
        html5QrCode.clear();
        setHtml5QrCode(null);
      }
    };
  }, [html5QrCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Mark Attendance
          </h1>
          <p className="text-lg text-slate-600 bg-white px-6 py-2 rounded-full shadow-sm border">
            {currentTime.toLocaleDateString()} | 🕒 {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Attendance Type Selection Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-slate-600 font-medium">1</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Select Attendance Type</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setCaptureType('check-in')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                captureType === 'check-in'
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                  : 'border-slate-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  captureType === 'check-in' ? 'bg-green-500' : 'bg-slate-200'
                }`}>
                  <svg className={`w-5 h-5 ${captureType === 'check-in' ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Check In</h3>
                  <p className="text-sm text-slate-500">Start your day</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setCaptureType('check-out')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                captureType === 'check-out'
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                  : 'border-slate-200 hover:border-red-300 hover:bg-red-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  captureType === 'check-out' ? 'bg-red-500' : 'bg-slate-200'
                }`}>
                  <svg className={`w-5 h-5 ${captureType === 'check-out' ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Check Out</h3>
                  <p className="text-sm text-slate-500">End your day</p>
                </div>
              </div>
            </button>
          </div>
            
          {/* Quick Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View History
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>
        
        {/* Method Selection */}
        {activeMode === 'selection' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-medium">2</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Choose Attendance Method</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Face Recognition - Commented out */} 
              <button
                onClick={() => setActiveMode('face')}
                className="group p-6 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Face Recognition</h3>
                  <p className="text-sm text-slate-600">Use camera for face detection</p>
                  <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full inline-block">
                    AI Powered
                  </div>
                </div>
              </button>
              
              <button
                onClick={startQRScanning}
                className="group p-6 border-2 border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-100 transition-colors">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">QR Code Scanner</h3>
                  <p className="text-sm text-slate-600">Scan QR code from your device</p>
                  <div className="mt-3 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full inline-block">
                    Quick & Easy
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveMode('manual')}
                className="group p-6 border-2 border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Manual Entry</h3>
                  <p className="text-sm text-slate-600">Click to mark attendance manually</p>
                  <div className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full inline-block">
                    Simple
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
        {activeMode === 'face' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Face Recognition</h2>
              <button
                onClick={() => setActiveMode('selection')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Back
              </button>
            </div>
            
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
              />
            </div>

            <div className="mt-4 text-center">
              {!modelsLoaded && (
                <p className="text-yellow-600">Loading face detection models...</p>
              )}
              {modelsLoaded && (
                <>
                  <p className={`mb-2 ${isFaceDetected ? 'text-green-600' : 'text-red-600'}`}>
                    {isFaceDetected 
                      ? `Face detected! Confidence: ${(faceDetectionConfidence * 100).toFixed(1)}%`
                      : 'No face detected'
                    }
                  </p>
                  <button
                    onClick={captureAttendance}
                    disabled={!isFaceDetected || faceDetectionConfidence < MIN_CONFIDENCE_THRESHOLD || isCapturing}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      isFaceDetected && faceDetectionConfidence >= MIN_CONFIDENCE_THRESHOLD && !isCapturing
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isCapturing ? 'Processing...' : `Mark ${captureType === 'check-in' ? 'Check-in' : 'Check-out'}`}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* QR Code Mode */}
        {activeMode === 'qr' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">QR Code Scanner</h2>
              </div>
              <button
                onClick={stopQRScanning}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
              >
                Back
              </button>
            </div>
            
            {qrError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-red-800">Camera Error</h4>
                </div>
                <p className="text-red-700 mb-3">{qrError}</p>
                <button 
                  onClick={startQRScanning}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-dashed border-slate-300">
              <div id="qr-reader" className="mx-auto max-w-md"></div>
            </div>
            
            <div className="mt-4 text-center text-slate-600">
              <p className="text-sm">Position the QR code within the camera frame to scan</p>
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {activeMode === 'manual' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Manual Attendance</h2>
              </div>
              <button
                onClick={() => setActiveMode('selection')}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200"
              >
                Back
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Ready to mark your {captureType === 'check-in' ? 'check-in' : 'check-out'}?
              </h3>
              <p className="text-slate-600 mb-6">
                Click the button below to mark your attendance manually
              </p>
              
              <button
                onClick={markManualAttendance}
                disabled={isCapturing}
                className={`px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 ${
                  !isCapturing
                    ? `${captureType === 'check-in' 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                      }`
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isCapturing ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  `Mark ${captureType === 'check-in' ? 'Check-in' : 'Check-out'}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Final Attendance Status - Enhanced */}
        {currentAttendance && !showSuccessMessage && (
          <div className={`border-2 rounded-2xl p-8 shadow-lg ${
            currentAttendance.type === 'check-in'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                currentAttendance.type === 'check-in'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}>
                {currentAttendance.type === 'check-in' ? (
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-white" />
                )}
              </div>
              
              <h3 className={`text-2xl font-bold mb-2 ${
                currentAttendance.type === 'check-in'
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}>
                {currentAttendance.type === 'check-in' 
                  ? 'Work Day Started! 🎉' 
                  : 'Work Day Completed! 🏁'
                }
              </h3>
              <p className={`mb-4 ${
                currentAttendance.type === 'check-in'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {currentAttendance.type === 'check-in' 
                  ? 'Your attendance has been recorded. Have a productive day!' 
                  : 'Thank you for your hard work today. See you tomorrow!'
                }
              </p>
              
              <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-green-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Type</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentAttendance.type === 'check-in' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {currentAttendance.type === 'check-in' ? '🔄 Check In' : '🔚 Check Out'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Time</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(currentAttendance.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Method</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                      {currentAttendance.method === 'qr' ? '📱 QR Code' : '✋ Manual'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate('/attendance-history')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View History
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setCurrentAttendance(null);
                    setActiveMode('selection');
                    setShowSuccessMessage(false);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Mark Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCapture;
