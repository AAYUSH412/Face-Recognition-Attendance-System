import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: format(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [filter, setFilter] = useState({
    status: "",
    verification: "",
    department: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [expandedRecord, setExpandedRecord] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [activeRecordActions, setActiveRecordActions] = useState(null);

  useEffect(() => {
    fetchAttendanceRecords();
    fetchDepartments();
  }, [currentPage, dateRange, filter]);

  // Fetch attendance records and departments functions - unchanged

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would use query params for pagination and filtering
      const response = await axios.get(
        `/api/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );

      // Access the records array from the response
      let filteredRecords = response.data.records || [];

      // Apply filters
      if (filter.status) {
        filteredRecords = filteredRecords.filter(
          (record) => record.status === filter.status
        );
      }

      if (filter.verification === "verified") {
        filteredRecords = filteredRecords.filter(
          (record) =>
            (record.checkIn?.verified || !record.checkIn?.time) &&
            (record.checkOut?.verified || !record.checkOut?.time)
        );
      } else if (filter.verification === "unverified") {
        filteredRecords = filteredRecords.filter(
          (record) =>
            (!record.checkIn?.verified && record.checkIn?.time) ||
            (!record.checkOut?.verified && record.checkOut?.time)
        );
      }

      if (filter.department) {
        filteredRecords = filteredRecords.filter(
          (record) => record.user.department?._id === filter.department
        );
      }

      if (searchTerm) {
        filteredRecords = filteredRecords.filter(
          (record) =>
            record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.user.email
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            record.user.registrationId
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      // Simple pagination (client-side for demo)
      const itemsPerPage = 10;
      const totalItems = filteredRecords.length;
      const pages = Math.ceil(totalItems / itemsPerPage);

      setTotalPages(pages || 1);

      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedRecords = filteredRecords.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setAttendanceRecords(paginatedRecords);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/api/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Other handlers and methods - unchanged

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchAttendanceRecords();
  };

  const handleFilterChange = (name, value) => {
    setFilter((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on new date range
  };

  const handleVerifyAttendance = async (recordId, type) => {
    try {
      await axios.patch(`/api/attendance/${recordId}/verify`, { type });
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`
      );

      // Update the record in the UI
      setAttendanceRecords((records) =>
        records.map((record) => {
          if (record._id === recordId) {
            return {
              ...record,
              [type]: {
                ...record[type],
                verified: true,
              },
            };
          }
          return record;
        })
      );
    } catch (error) {
      console.error(`Error verifying ${type}:`, error);
      toast.error(`Failed to verify ${type}`);
    }
  };

  const handleRejectAttendance = async (recordId, type) => {
    if (!window.confirm(`Are you sure you want to reject this ${type}?`))
      return;

    try {
      await axios.patch(`/api/attendance/${recordId}/reject`, { type });
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} rejected successfully`
      );

      // Update the record in the UI
      setAttendanceRecords((records) =>
        records.map((record) => {
          if (record._id === recordId) {
            return {
              ...record,
              [type]: {
                ...record[type],
                time: null,
                imageUrl: null,
                verified: false,
              },
            };
          }
          return record;
        })
      );
    } catch (error) {
      console.error(`Error rejecting ${type}:`, error);
      toast.error(`Failed to reject ${type}`);
    }
  };

  const exportToCSV = async () => {
    try {
      toast.loading("Preparing export...", { id: "exportToast" });
      const response = await axios.get(
        `/api/attendance/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          responseType: "blob",
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance_${dateRange.startDate}_to_${dateRange.endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export complete! File downloaded successfully.", {
        id: "exportToast",
      });
    } catch (error) {
      console.error("Error exporting attendance:", error);
      toast.error("Failed to export attendance", { id: "exportToast" });
    }
  };

  const resetFilters = () => {
    setFilter({ status: "", verification: "", department: "" });
    setSearchTerm("");
    setDateRange({
      startDate: format(
        new Date(new Date().setDate(new Date().getDate() - 30)),
        "yyyy-MM-dd"
      ),
      endDate: format(new Date(), "yyyy-MM-dd"),
    });
    toast.success("Filters have been reset");
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "late":
        return <ClockIcon className="h-4 w-4" />;
      case "absent":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Attendance Records
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage attendance records for all users
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            <DocumentArrowDownIcon
              className="-ml-1 mr-2 h-5 w-5"
              aria-hidden="true"
            />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 transition-all duration-300 ease-in-out">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2 text-purple-500" />
              Filter Attendance Records
            </h3>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <ArrowPathIcon
                className="-ml-0.5 mr-2 h-4 w-4"
                aria-hidden="true"
              />
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 flex items-center"
              >
                <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 flex items-center"
              >
                <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 flex items-center"
              >
                <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-500" />
                Department
              </label>
              <select
                id="department"
                name="department"
                value={filter.department}
                onChange={(e) =>
                  handleFilterChange("department", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-6">
              <form
                onSubmit={handleSearch}
                className="relative rounded-md shadow-sm"
              >
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-purple-500 focus:border-purple-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by name, email, or ID..."
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="submit"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <MagnifyingGlassIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "")}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === ""
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : "border-gray-300 text-gray-700 bg-white"
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150`}
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "present")}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === "present"
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : "border-gray-300 text-gray-700 bg-white"
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "late")}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === "late"
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : "border-gray-300 text-gray-700 bg-white"
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150`}
                >
                  <ClockIcon className="h-4 w-4 mr-1.5" />
                  Late
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("status", "absent")}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.status === "absent"
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : "border-gray-300 text-gray-700 bg-white"
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150`}
                >
                  <XCircleIcon className="h-4 w-4 mr-1.5" />
                  Absent
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Filter
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFilterChange("verification", "")}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.verification === ""
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : "border-gray-300 text-gray-700 bg-white"
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150`}
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange("verification", "verified")}
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.verification === "verified"
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : "border-gray-300 text-gray-700 bg-white"
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150`}
                >
                  <CheckIcon className="h-4 w-4 mr-1.5" />
                  Verified
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleFilterChange("verification", "unverified")
                  }
                  className={`inline-flex items-center px-3 py-1.5 border ${
                    filter.verification === "unverified"
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : "border-gray-300 text-gray-700 bg-white"
                  } text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-150`}
                >
                  <XMarkIcon className="h-4 w-4 mr-1.5" />
                  Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-b-2 border-transparent border-l-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading attendance records...
            </p>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        ) : attendanceRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check In
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check Out
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr
                    key={record._id}
                    className={
                      expandedRecord === record._id
                        ? "bg-purple-50"
                        : "hover:bg-gray-50 transition-colors duration-150"
                    }
                    onMouseEnter={() => setActiveRecordActions(record._id)}
                    onMouseLeave={() => setActiveRecordActions(null)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                            {record.user?.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.user?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.user?.email}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {record.user?.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkIn?.time ? (
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full ${
                              record.checkIn.verified
                                ? "bg-green-100"
                                : "bg-yellow-100"
                            } flex items-center justify-center mr-2`}
                          >
                            {record.checkIn.verified ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(record.checkIn.time).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.checkIn.verified
                                ? "Verified"
                                : "Pending verification"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not recorded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkOut?.time ? (
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full ${
                              record.checkOut.verified
                                ? "bg-green-100"
                                : "bg-yellow-100"
                            } flex items-center justify-center mr-2`}
                          >
                            {record.checkOut.verified ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(
                                record.checkOut.time
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.checkOut.verified
                                ? "Verified"
                                : "Pending verification"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not recorded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex items-center text-xs font-medium rounded-full ${getStatusBadgeClasses(
                          record.status
                        )}`}
                      >
                        {getStatusIcon(record.status)}
                        <span className="ml-1.5 capitalize">
                          {record.status || "Unknown"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedRecord(
                              expandedRecord === record._id ? null : record._id
                            )
                          }
                          className={`text-purple-600 hover:text-purple-900 transition-colors ${
                            expandedRecord === record._id ? "font-medium" : ""
                          }`}
                        >
                          {expandedRecord === record._id
                            ? "Hide Details"
                            : "View Details"}
                        </button>

                        {/* Extra actions that appear on hover */}
                        {activeRecordActions === record._id &&
                          !record.checkIn?.verified &&
                          record.checkIn?.time && (
                            <button
                              onClick={() =>
                                handleVerifyAttendance(record._id, "checkIn")
                              }
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              Verify In
                            </button>
                          )}

                        {activeRecordActions === record._id &&
                          !record.checkOut?.verified &&
                          record.checkOut?.time && (
                            <button
                              onClick={() =>
                                handleVerifyAttendance(record._id, "checkOut")
                              }
                              className="text-green-600 hover:text-green-800 transition-colors"
                            >
                              Verify Out
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <InformationCircleIcon className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No records found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No attendance records match your search criteria.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <ArrowPathIcon
                  className="-ml-1 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            aria-label="Pagination"
          >
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span>{" "}
                of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                Next
                <ChevronRightIcon className="h-5 w-5 ml-1" />
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Attendance;
