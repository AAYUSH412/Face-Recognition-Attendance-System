import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  QrCodeIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regeneratingQR, setRegeneratingQR] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    setLoading(true);
    try {
      const eventResponse = await axios.get(`/api/events/${id}`);
      setEvent(eventResponse.data);

      // Fetch attendee count
      const attendeesResponse = await axios.get(`/api/events/${id}/attendees`);
      setAttendeeCount(attendeesResponse.data.length);
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast.error("Failed to load event details");
      if (error.response?.status === 404) {
        navigate("/events");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/events/${id}`);
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleRegenerateQR = async () => {
    if (
      !window.confirm(
        "Are you sure you want to regenerate the QR code? The old QR code will no longer work."
      )
    ) {
      return;
    }

    setRegeneratingQR(true);
    try {
      const response = await axios.post(`/api/events/${id}/regenerate-qr`);
      const updatedEvent = { ...event, qrCodeData: response.data.qrCodeData };
      setEvent(updatedEvent);
      toast.success("QR code regenerated successfully");
      setShowQR(true);
    } catch (error) {
      console.error("Error regenerating QR code:", error);
      toast.error("Failed to regenerate QR code");
    } finally {
      setRegeneratingQR(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const getEventStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (!event.isActive) {
      return (
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          Inactive
        </span>
      );
    } else if (now < startDate) {
      return (
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Upcoming
        </span>
      );
    } else if (now > endDate) {
      return (
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          Completed
        </span>
      );
    } else {
      return (
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Active
        </span>
      );
    }
  };

  const getAccessTypeBadge = () => {
    if (event.attendeeType === "all") {
      return (
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
          Open to All
        </span>
      );
    } else if (event.attendeeType === "department") {
      return (
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          Department Specific
        </span>
      );
    } else {
      return (
        <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
          Invitation Only
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Event not found. It may have been deleted.
            </p>
            <div className="mt-4">
              <Link
                to="/events"
                className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
              >
                ← Back to all events
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          <li>
            <Link to="/events" className="text-gray-500 hover:text-gray-700">
              Events
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
            <span className="text-gray-900 font-medium">{event.name}</span>
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Link
              to="/events"
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            Event Details
          </h1>

          <div className="mt-2 sm:mt-0 flex flex-wrap gap-2">
            <Link
              to={`/events/${id}/attendees`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <UserGroupIcon className="h-4 w-4 mr-1.5 text-gray-500" />
              View Attendees
            </Link>
            <Link
              to={`/events/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-1.5 text-gray-500" />
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-1.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-purple-600" />
            {event.name}
          </h2>
          <div className="flex gap-2">
            {getEventStatusBadge()}
            {getAccessTypeBadge()}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Event Information
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    Start Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(event.startDate)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    End Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(event.endDate)}
                  </dd>
                </div>

                {event.location && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                      Location
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {event.location}
                    </dd>
                  </div>
                )}

                {event.department && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                      Department
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {event.department.name}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    Organizer
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {event.organizer?.name || "Unknown"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    Attendees
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link
                      to={`/events/${id}/attendees`}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      {attendeeCount} attendee{attendeeCount !== 1 ? "s" : ""}
                    </Link>
                  </dd>
                </div>
              </dl>

              {event.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </h4>
                  <div className="prose-sm prose-purple max-w-none text-gray-900">
                    <p>{event.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <QrCodeIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Event QR Code
                </h3>

                {showQR ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-lg shadow mb-4">
                      <QRCodeSVG
                        value={event.qrCodeData?.value || "Invalid QR Code"}
                        size={200}
                        level="H"
                        includeMargin={true}
                        className="mx-auto"
                      />
                    </div>

                    <div className="text-sm text-gray-500 mb-4 text-center">
                      <p>QR code will expire on:</p>
                      <p className="font-medium text-gray-700">
                        {event.qrCodeData?.expiresAt
                          ? new Date(
                              event.qrCodeData.expiresAt
                            ).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQR(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Hide QR Code
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 mb-4">
                      The QR code is hidden for security. Click the button below
                      to show it.
                    </p>
                    <div className="flex flex-col space-y-3">
                      <button
                        type="button"
                        onClick={() => setShowQR(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <QrCodeIcon className="h-4 w-4 mr-1.5" />
                        Show QR Code
                      </button>

                      <button
                        type="button"
                        onClick={handleRegenerateQR}
                        disabled={regeneratingQR}
                        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                          regeneratingQR ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {regeneratingQR ? (
                          <>
                            <ArrowPathIcon className="animate-spin h-4 w-4 mr-1.5" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                            Regenerate QR Code
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Instructions
                  </h4>
                  <ul className="text-xs text-gray-500 space-y-2 list-disc pl-5">
                    <li>
                      Display this QR code at your event for attendees to scan
                    </li>
                    <li>
                      Students can scan this code from their mobile app to mark
                      attendance
                    </li>
                    <li>
                      You can regenerate this QR code if needed (old QR codes
                      will stop working)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
