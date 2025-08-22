import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import {
  QrCodeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    // Clean up when component unmounts or when scanning state changes to false
    if (!scanning && html5QrCode && html5QrCode.isScanning) {
      html5QrCode.stop().catch(err => console.error('Error stopping scanner:', err));
    }
    
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, [scanning, html5QrCode]);

  const startScanner = () => {
    setScanning(true);
    setScanResult(null);
    setEventDetails(null);

    // Add a small delay to ensure DOM element exists
    setTimeout(() => {
      try {
        const qrCodeScanner = new Html5Qrcode('reader');
        setHtml5QrCode(qrCodeScanner);
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
        qrCodeScanner
          .start(
            { facingMode: 'environment' },
            config,
            onScanSuccess,
            onScanFailure
          )
          .catch(err => {
            toast.error('Failed to start camera. Please check camera permissions.');
            console.error('Error starting scanner:', err);
            setScanning(false);
          });
      } catch (error) {
        console.error('Error initializing scanner:', error);
        toast.error('Could not initialize scanner');
        setScanning(false);
      }
    }, 500);
  };

  const stopScanner = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode.stop()
        .then(() => {
          setScanning(false);
        })
        .catch(err => {
          console.error('Error stopping scanner:', err);
          setScanning(false);
        });
    }
  };

  const onScanSuccess = async (decodedText) => {
    // Stop scanning once we get a result
    if (html5QrCode && html5QrCode.isScanning) {
      await html5QrCode.stop();
      setScanning(false);
    }
  
    setScanResult(decodedText);
    processQrCode(decodedText);
  };

  const onScanFailure = (error) => {
    console.warn('QR code scan error:', error);
  };

  const processQrCode = async (qrData) => {
    setProcessing(true);
    try {
      const response = await api.post('/api/events/verify-attendance', { 
        qrCodeData: qrData 
      });
      
      toast.success(response.data.message);
      setEventDetails(response.data.event);
      // Scanner is already turned off in onScanSuccess
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error(error.response?.data?.message || 'Failed to process QR code');
      setScanResult(null);
      // No need to restart scanner here, it's already off
    } finally {
      setProcessing(false);
    }
  };

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

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <QrCodeIcon className="h-5 w-5 mr-2 text-indigo-500" />
          QR Code Scanner
        </h3>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {!scanning && !scanResult && (
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
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <QrCodeIcon className="-ml-1 mr-2 h-5 w-5" />
                Start Scanning
              </button>
            </div>
          </div>
        )}

        {scanning && (
          <div className="text-center">
            <div id="reader" className="mx-auto" style={{ width: '100%', maxWidth: '500px' }}></div>
            <div className="mt-4">
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
          </div>
        )}

        {processing && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-sm font-medium text-gray-700">Processing QR code...</p>
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
              </div>
            </div>
          </div>
        )}

        {scanResult && !eventDetails && !processing && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-100">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Invalid or expired QR code</h3>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={startScanner}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;