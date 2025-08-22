import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as blazeface from '@tensorflow-models/blazeface';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const AttendanceCapture = () => {
  const navigate = useNavigate();
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceDetectionConfidence, setFaceDetectionConfidence] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [blazeFaceModel, setBlazeFaceModel] = useState(null);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [activeMode, setActiveMode] = useState('selection'); // 'selection', 'face', 'qr', 'manual'
  const [captureType, setCaptureType] = useState("check-in");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [qrError, setQrError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const MIN_CONFIDENCE_THRESHOLD = 0.5;

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      toast.error('Please ensure your face is clearly visible and detected');
      return;
    }

    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      const response = await api.post('/api/attendance/mark', {
        type: captureType,
        imageData: imageSrc,
        timestamp: new Date().toISOString(),
        method: 'face'
      });

      if (response.data.success) {
        setCurrentAttendance(response.data.attendance);
        setShowSuccessMessage(true);
        toast.success(`Face ${captureType === 'check-in' ? 'Check-in' : 'Check-out'} successful!`);
        // Don't auto-redirect - stay in face mode for multiple captures
      } else {
        toast.error('Attendance marking failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Error marking attendance: ' + (error.response?.data?.message || error.message));
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
        toast.success(`Manual ${captureType === 'check-in' ? 'Check-in' : 'Check-out'} successful!`);
        // Don't auto-redirect - stay in manual mode
      } else {
        toast.error('Manual attendance marking failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error marking manual attendance:', error);
      toast.error('Error marking manual attendance: ' + (error.response?.data?.message || error.message));
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
                timestamp: new Date().toISOString(),
                method: 'qr'
              });

              if (response.data.success) {
                setCurrentAttendance(response.data.attendance);
                setShowSuccessMessage(true);
                toast.success(`QR ${captureType === 'check-in' ? 'Check-in' : 'Check-out'} successful!`);
                // Don't auto-redirect - stay in QR mode for multiple scans
              } else {
                toast.error('QR attendance marking failed: ' + response.data.message);
              }
            } catch (error) {
              console.error('Error processing QR code:', error);
              toast.error('Error processing QR code: ' + (error.response?.data?.message || error.message));
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
      toast.error('Failed to start QR scanner');
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
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mark Attendance
            </h1>
            <p className="text-lg text-gray-600">
              {currentTime.toLocaleString()}
            </p>
          </div>

          {/* Attendance Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Attendance Type</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setCaptureType('check-in')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  captureType === 'check-in'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Check In
              </button>
              <button
                onClick={() => setCaptureType('check-out')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  captureType === 'check-out'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Check Out
              </button>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => navigate('/history')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📊 View History
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🏠 Dashboard
              </button>
            </div>
          </div>

          {/* Success Message */}
          {showSuccessMessage && currentAttendance && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ✅ Attendance Marked Successfully!
                  </h3>
                  <div className="text-green-700">
                    <p><strong>Type:</strong> {currentAttendance.type}</p>
                    <p><strong>Time:</strong> {new Date(currentAttendance.timestamp).toLocaleString()}</p>
                    <p><strong>Method:</strong> {currentAttendance.method}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Method Selection */}
          {activeMode === 'selection' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Choose Attendance Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveMode('face')}
                  className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">👤</div>
                    <h3 className="font-semibold">Face Recognition</h3>
                    <p className="text-sm text-gray-600">Use camera for face detection</p>
                  </div>
                </button>
                
                <button
                  onClick={startQRScanning}
                  className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📱</div>
                    <h3 className="font-semibold">QR Code</h3>
                    <p className="text-sm text-gray-600">Scan QR code</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveMode('manual')}
                  className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">✋</div>
                    <h3 className="font-semibold">Manual</h3>
                    <p className="text-sm text-gray-600">Click to mark attendance</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Face Recognition Mode */}
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">QR Code Scanner</h2>
                <button
                  onClick={stopQRScanning}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
              </div>
              
              {qrError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p className="font-medium">Camera Error:</p>
                  <p>{qrError}</p>
                  <button 
                    onClick={startQRScanning}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
              
              <div id="qr-reader" className="mx-auto max-w-md"></div>
            </div>
          )}

          {/* Manual Mode */}
          {activeMode === 'manual' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manual Attendance</h2>
                <button
                  onClick={() => setActiveMode('selection')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Click the button below to mark your {captureType === 'check-in' ? 'check-in' : 'check-out'}
                </p>
                <button
                  onClick={markManualAttendance}
                  disabled={isCapturing}
                  className={`px-8 py-4 rounded-lg font-medium text-lg ${
                    !isCapturing
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCapturing ? 'Processing...' : `Mark ${captureType === 'check-in' ? 'Check-in' : 'Check-out'}`}
                </button>
              </div>
            </div>
          )}

          {/* Current Attendance Status */}
          {currentAttendance && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Attendance Marked Successfully!
              </h3>
              <div className="text-green-700 mb-4">
                <p><strong>Type:</strong> {currentAttendance.type}</p>
                <p><strong>Time:</strong> {new Date(currentAttendance.timestamp).toLocaleString()}</p>
                <p><strong>Method:</strong> {currentAttendance.method}</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/attendance-history')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View History
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setCurrentAttendance(null);
                    setActiveMode('selection');
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default AttendanceCapture;
