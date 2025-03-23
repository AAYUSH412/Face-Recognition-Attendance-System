import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CameraIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

const AttendanceCapture = () => {
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  const [captureType, setCaptureType] = useState("check-in");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceDetectionConfidence, setFaceDetectionConfidence] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [blazeFaceModel, setBlazeFaceModel] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const minConfidenceThreshold = 0.5;

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load TensorFlow model and fetch attendance data
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        console.log("TensorFlow.js is ready");

        const model = await blazeface.load();
        console.log("BlazeFace model loaded successfully");

        setBlazeFaceModel(model);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading face detection model:", error);
        toast.error("Failed to load face detection model");
      }
    };

    loadModel();
    fetchTodayAttendance();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(
        `/api/attendance/me?startDate=${today}&endDate=${today}`
      );
      if (response.data.length > 0) {
        setCurrentAttendance(response.data[0]);
        const attendance = response.data[0];
        if (attendance.checkIn?.time && !attendance.checkOut?.time) {
          setCaptureType("check-out");
        }
      } else {
        setCurrentAttendance(null);
        setCaptureType("check-in");
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      toast.error("Failed to fetch attendance data");
    }
  };

  const startCamera = async (type) => {
    setCaptureType(type);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(newStream);
      setIsCaptureMode(true);
      setHasCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error(
        "Could not access camera. Please ensure camera permissions are granted."
      );
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCaptureMode(false);
    setIsFaceDetected(false);
  };

  // Detect faces using TensorFlow.js and BlazeFace
  useEffect(() => {
    if (
      !webcamRef.current ||
      !canvasRef.current ||
      !modelsLoaded ||
      !blazeFaceModel ||
      !isCaptureMode
    )
      return;

    const detectFaces = async () => {
      if (webcamRef.current.video.readyState !== 4) return;

      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      try {
        const predictions = await blazeFaceModel.estimateFaces(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
          setIsFaceDetected(true);
          const confidence = predictions[0].probability[0];
          setFaceDetectionConfidence(confidence);

          predictions.forEach((prediction) => {
            const start = prediction.topLeft;
            const end = prediction.bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];

            // Draw fancy rectangle
            ctx.strokeStyle = "#10B981";
            ctx.lineWidth = 3;
            
            // Draw rounded rectangle
            const radius = 10;
            ctx.beginPath();
            ctx.moveTo(start[0] + radius, start[1]);
            ctx.lineTo(start[0] + size[0] - radius, start[1]);
            ctx.arcTo(start[0] + size[0], start[1], start[0] + size[0], start[1] + radius, radius);
            ctx.lineTo(start[0] + size[0], start[1] + size[1] - radius);
            ctx.arcTo(start[0] + size[0], start[1] + size[1], start[0] + size[0] - radius, start[1] + size[1], radius);
            ctx.lineTo(start[0] + radius, start[1] + size[1]);
            ctx.arcTo(start[0], start[1] + size[1], start[0], start[1] + size[1] - radius, radius);
            ctx.lineTo(start[0], start[1] + radius);
            ctx.arcTo(start[0], start[1], start[0] + radius, start[1], radius);
            ctx.stroke();

            // Label
            ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
            ctx.fillRect(start[0], start[1] - 25, 100, 25);
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText("Face Detected", start[0] + 10, start[1] - 8);

            // Draw keypoints
            if (prediction.landmarks) {
              prediction.landmarks.forEach((landmark) => {
                ctx.fillStyle = "#3B82F6";
                ctx.beginPath();
                ctx.arc(landmark[0], landmark[1], 3, 0, 2 * Math.PI);
                ctx.fill();
              });
            }
          });
        } else {
          setIsFaceDetected(false);
          setFaceDetectionConfidence(0);
        }
      } catch (error) {
        console.error("Error during face detection:", error);
      }
    };

    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  }, [webcamRef, canvasRef, modelsLoaded, blazeFaceModel, isCaptureMode]);

  const captureImage = async () => {
    setIsCapturing(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();

      let location = null;
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      } catch (locationError) {
        console.warn("Location access denied or unavailable", locationError);
      }

      try {
        const response = await axios.post("/api/attendance/mark", {
          base64Image: imageSrc,
          confidence: faceDetectionConfidence,
          location,
          type: captureType,
        });

        toast.success(response.data.message);
        setCurrentAttendance(response.data.attendance);
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.attendance) {
          setCurrentAttendance(error.response.data.attendance);
          toast.warning(
            error.response.data.message || "Already marked attendance for today"
          );
        } else {
          throw error;
        }
      }

      stopCamera();
    } catch (error) {
      console.error("Error capturing attendance:", error);
      toast.error(
        error.response?.data?.message || "Failed to record attendance"
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <ClockIcon className="h-7 w-7 mr-2 text-indigo-600" />
          Mark Attendance
        </h1>
        
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            {currentTime.toLocaleDateString([], { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
          <ClockIcon className="h-5 w-5 mr-1.5" />
          <span className="text-sm font-medium">
            {currentTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </span>
        </div>
        
        <button
          type="button"
          onClick={fetchTodayAttendance}
          className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1.5" />
          Refresh Status
        </button>
      </div>

      <div className="mt-6 bg-white shadow-lg overflow-hidden rounded-xl border border-gray-100">
        {!isCaptureMode ? (
          <div className="p-6">
            {currentAttendance ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Today's Attendance
                  </h2>
                  <div className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                    {currentAttendance.status === 'present' ? 'Present' : 
                     currentAttendance.status === 'late' ? 'Late' : 'Pending'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Check In Card */}
                  <div className={`p-5 rounded-xl border ${
                    currentAttendance.checkIn?.time 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-800">Check In</h3>
                      <div className={`rounded-full p-2 ${
                        currentAttendance.checkIn?.time 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentAttendance.checkIn?.time 
                          ? <CheckCircleIcon className="h-6 w-6" /> 
                          : <ClockIcon className="h-6 w-6" />
                        }
                      </div>
                    </div>
                    
                    {currentAttendance.checkIn?.time ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">
                            {formatTime(currentAttendance.checkIn.time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <UserCircleIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">
                            {currentAttendance.checkIn.verified 
                              ? 'Verified' 
                              : 'Pending verification'}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          disabled={true}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm flex items-center justify-center cursor-not-allowed"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                          Already Checked In
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          You haven't checked in yet. Record your attendance now.
                        </p>
                        <button
                          type="button"
                          onClick={() => startCamera("check-in")}
                          className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center transition-colors"
                        >
                          <CameraIcon className="h-4 w-4 mr-1.5" />
                          Check In Now
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Check Out Card */}
                  <div className={`p-5 rounded-xl border ${
                    currentAttendance.checkOut?.time 
                      ? 'bg-green-50 border-green-200' 
                      : currentAttendance.checkIn?.time 
                        ? 'bg-indigo-50 border-indigo-200' 
                        : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-800">Check Out</h3>
                      <div className={`rounded-full p-2 ${
                        currentAttendance.checkOut?.time 
                          ? 'bg-green-100 text-green-600' 
                          : currentAttendance.checkIn?.time 
                            ? 'bg-indigo-100 text-indigo-600' 
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentAttendance.checkOut?.time 
                          ? <CheckCircleIcon className="h-6 w-6" /> 
                          : currentAttendance.checkIn?.time 
                            ? <ClockIcon className="h-6 w-6" />
                            : <XCircleIcon className="h-6 w-6" />
                        }
                      </div>
                    </div>
                    
                    {currentAttendance.checkOut?.time ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">
                            {formatTime(currentAttendance.checkOut.time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <UserCircleIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">
                            {currentAttendance.checkOut.verified 
                              ? 'Verified' 
                              : 'Pending verification'}
                          </span>
                        </div>
                        
                        <button
                          type="button"
                          disabled={true}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm flex items-center justify-center cursor-not-allowed"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                          Already Checked Out
                        </button>
                      </div>
                    ) : currentAttendance.checkIn?.time ? (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          You can check out now to complete your attendance.
                        </p>
                        <button
                          type="button"
                          onClick={() => startCamera("check-out")}
                          className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center transition-colors"
                        >
                          <CameraIcon className="h-4 w-4 mr-1.5" />
                          Check Out Now
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          You need to check in first before checking out.
                        </p>
                        <button
                          type="button"
                          disabled={true}
                          className="w-full py-2 px-3 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm flex items-center justify-center cursor-not-allowed"
                        >
                          <CameraIcon className="h-4 w-4 mr-1.5" />
                          Check In First
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <CameraIcon className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No Attendance Recorded Today
                </h3>
                <p className="mt-1 text-gray-500 max-w-sm mx-auto">
                  Mark your attendance using facial recognition to keep track of your check-in and check-out times.
                </p>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => startCamera("check-in")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <CameraIcon className="h-5 w-5 mr-2" />
                    Check In
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {captureType === "check-in" ? "Checking In" : "Checking Out"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Position your face in the frame and click the button below
              </p>
            </div>
            
            <div className="relative flex justify-center">
              {hasCamera ? (
                <div className="relative rounded-xl overflow-hidden shadow-lg border-4 border-indigo-100">
                  <Webcam
                    audio={false}
                    mirrored={true}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full max-w-lg h-auto"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 right-0 mx-auto z-10"
                    style={{
                      width: webcamRef.current?.video?.videoWidth || "100%",
                      maxWidth: "100%",
                    }}
                  />
                  
                  {/* Camera overlay with scan animation */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="h-full w-full flex flex-col justify-between p-4">
                      <div className="flex justify-between">
                        <div className="h-6 w-6 border-t-2 border-l-2 border-indigo-500"></div>
                        <div className="h-6 w-6 border-t-2 border-r-2 border-indigo-500"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-6 w-6 border-b-2 border-l-2 border-indigo-500"></div>
                        <div className="h-6 w-6 border-b-2 border-r-2 border-indigo-500"></div>
                      </div>
                    </div>
                    {/* Scanning animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" 
                      style={{
                        animation: "scan 2s ease-in-out infinite",
                      }}
                    ></div>
                    <style jsx>{`
                      @keyframes scan {
                        0% { transform: translateY(0); opacity: 0.7; }
                        50% { transform: translateY(calc(100vh - 4px)); opacity: 0.7; }
                        100% { transform: translateY(0); opacity: 0.7; }
                      }
                    `}</style>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 flex items-center justify-center h-64 w-full max-w-lg rounded-xl border border-gray-200">
                  <div className="text-center px-4">
                    <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-2 text-base font-medium text-gray-900">
                      Camera not available
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Please ensure camera permissions are granted.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <XCircleIcon className="h-5 w-5 mr-1.5 text-gray-500" />
                Cancel
              </button>
              <button
                type="button"
                onClick={captureImage}
                disabled={isCapturing || !isFaceDetected}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                  isCapturing || !isFaceDetected
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                <CameraIcon className="h-5 w-5 mr-1.5" />
                {isCapturing
                  ? "Processing..."
                  : captureType === "check-in"
                  ? "Confirm Check In"
                  : "Confirm Check Out"}
              </button>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Face Detection:
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isFaceDetected
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isFaceDetected ? "Detected" : "Not Detected"}
                </span>
              </div>
              
              {isFaceDetected && (
                <div className="mt-2">
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      Confidence:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(faceDetectionConfidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        faceDetectionConfidence > 0.7
                          ? "bg-green-500"
                          : faceDetectionConfidence > 0.5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.round(faceDetectionConfidence * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with helpful tips */}
      <div className="mt-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
        <h3 className="text-sm font-medium text-indigo-800 mb-2">Tips for Attendance Capture</h3>
        <ul className="text-xs text-indigo-700 space-y-1.5">
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>Make sure your face is clearly visible and well-lit</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>Remove any face coverings for accurate recognition</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>Position your face in the center of the frame</span>
          </li>
          <li className="flex items-start">
            <CheckCircleIcon className="h-4 w-4 text-indigo-500 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>Allow location access for precise attendance records</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceCapture;