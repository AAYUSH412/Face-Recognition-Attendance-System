import { useState, useEffect, useCallback } from "react";
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
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  PhotoIcon,
  MapPinIcon,
  UserGroupIcon,
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
  const [showFilters, setShowFilters] = useState(true);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    pendingVerification: 0,
  });

  const fetchAttendanceRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      if (filter.status) params.append("status", filter.status);
      if (filter.verification) params.append("verification", filter.verification);
      if (filter.department) params.append("departmentId", filter.department);

      const response = await axios.get(`/api/attendance?${params.toString()}`);
      
      setAttendanceRecords(response.data.records || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateRange, filter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/attendance/admin/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [dateRange]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  useEffect(() => {
    fetchAttendanceRecords();
    fetchDepartments();
    fetchUsers();
    fetchStats();
  }, [fetchAttendanceRecords, fetchStats]);

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

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?"))
      return;

    try {
      await axios.delete(`/api/attendance/${recordId}`);
      toast.success("Attendance record deleted successfully");
      
      // Remove record from UI
      setAttendanceRecords((records) =>
        records.filter((record) => record._id !== recordId)
      );
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete attendance record");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedRecords.length === 0) {
      toast.error("Please select records to perform bulk action");
      return;
    }

    try {
      const promises = selectedRecords.map(recordId => {
        switch (action) {
          case 'verify-checkin':
            return axios.patch(`/api/attendance/${recordId}/verify`, { type: 'checkIn' });
          case 'verify-checkout':
            return axios.patch(`/api/attendance/${recordId}/verify`, { type: 'checkOut' });
          case 'delete':
            return axios.delete(`/api/attendance/${recordId}`);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      toast.success(`Bulk ${action} completed successfully`);
      
      // Refresh data
      fetchAttendanceRecords();
      setSelectedRecords([]);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === attendanceRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(attendanceRecords.map(record => record._id));
    }
  };

  const openDetailModal = (record) => {
    setCurrentRecord(record);
    setShowDetailModal(true);
  };

  const handleCreateManualAttendance = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const data = {
        userId: formData.get('userId'),
        date: formData.get('date'),
        status: formData.get('status'),
        checkInTime: formData.get('checkInTime') || null,
        checkOutTime: formData.get('checkOutTime') || null,
        notes: formData.get('notes') || ''
      };

      await axios.post('/api/attendance/admin/create', data);
      toast.success("Manual attendance record created successfully");
      setShowCreateModal(false);
      fetchAttendanceRecords(); // Refresh the list
    } catch (error) {
      console.error("Error creating manual attendance:", error);
      toast.error(error.response?.data?.message || "Failed to create attendance record");
    }
  };

  const closeDetailModal = () => {
    setCurrentRecord(null);
    setShowDetailModal(false);
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
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Record
          </button>

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

      {/* Statistics Dashboard */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Records
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Present
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.present || 0}
                    <span className="ml-2 text-sm text-green-600">
                      ({stats.presentPercentage || 0}%)
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Late
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.late || 0}
                    <span className="ml-2 text-sm text-yellow-600">
                      ({stats.latePercentage || 0}%)
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Absent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.absent || 0}
                    <span className="ml-2 text-sm text-red-600">
                      ({stats.absentPercentage || 0}%)
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <InformationCircleIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pendingVerification || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
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
                className="text-sm font-medium text-gray-700 flex items-center"
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
                className="text-sm font-medium text-gray-700 flex items-center"
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
                className="text-sm font-medium text-gray-700 flex items-center"
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

      {/* Bulk Actions */}
      {selectedRecords.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {selectedRecords.length} record(s) selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleBulkAction('verify-checkin')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Verify Check-ins
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('verify-checkout')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Verify Check-outs
              </button>
              <button
                type="button"
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecords([])}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Clear Selection
              </button>
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
                  <th scope="col" className="relative px-6 py-3">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      checked={selectedRecords.length === attendanceRecords.length && attendanceRecords.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
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
                      selectedRecords.includes(record._id)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50 transition-colors duration-150"
                    }
                  >
                    <td className="relative px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={selectedRecords.includes(record._id)}
                        onChange={() => handleSelectRecord(record._id)}
                      />
                    </td>
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
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => openDetailModal(record)}
                          className="text-purple-600 hover:text-purple-900 transition-colors p-1 rounded hover:bg-purple-50"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCurrentRecord(record)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Edit Record"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        {!record.checkIn?.verified && record.checkIn?.time && (
                          <button
                            onClick={() =>
                              handleVerifyAttendance(record._id, "checkIn")
                            }
                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                            title="Verify Check-in"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}

                        {!record.checkOut?.verified && record.checkOut?.time && (
                          <button
                            onClick={() =>
                              handleVerifyAttendance(record._id, "checkOut")
                            }
                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                            title="Verify Check-out"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}

                        {record.checkIn?.time && !record.checkIn?.verified && (
                          <button
                            onClick={() =>
                              handleRejectAttendance(record._id, "checkIn")
                            }
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                            title="Reject Check-in"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record._id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete Record"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
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

      {/* Create Manual Attendance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateManualAttendance}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create Manual Attendance Record
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User
                      </label>
                      <select
                        name="userId"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        name="date"
                        type="date"
                        required
                        defaultValue={format(new Date(), "yyyy-MM-dd")}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      >
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Check-in Time
                      </label>
                      <input
                        name="checkInTime"
                        type="time"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Check-out Time
                      </label>
                      <input
                        name="checkOutTime"
                        type="time"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        placeholder="Add any additional notes..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Record
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && currentRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Attendance Record Details
                  </h3>
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
                          {currentRecord.user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{currentRecord.user?.name}</p>
                          <p className="text-sm text-gray-500">{currentRecord.user?.email}</p>
                          <p className="text-xs text-gray-500 capitalize">{currentRecord.user?.role}</p>
                        </div>
                      </div>
                      {currentRecord.user?.department && (
                        <div className="flex items-center text-sm text-gray-600">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          {currentRecord.user.department.name}
                        </div>
                      )}
                      {currentRecord.user?.registrationId && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">ID:</span> {currentRecord.user.registrationId}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Record Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(currentRecord.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(currentRecord.status)}`}>
                          {getStatusIcon(currentRecord.status)}
                          <span className="ml-1 capitalize">{currentRecord.status}</span>
                        </span>
                      </div>
                      {currentRecord.hoursWorked && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Hours Worked:</span>
                          <span className="text-sm font-medium text-gray-900">{currentRecord.hoursWorked} hrs</span>
                        </div>
                      )}
                      {currentRecord.location && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Location:</span>
                          <span className="text-sm font-medium text-gray-900 flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {currentRecord.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Check-in Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Check-in Details</h4>
                    {currentRecord.checkIn?.time ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Time:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(currentRecord.checkIn.time).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Method:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {currentRecord.checkIn.method || 'face_recognition'}
                          </span>
                        </div>
                        {currentRecord.checkIn.confidence && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {(currentRecord.checkIn.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Verified:</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            currentRecord.checkIn.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {currentRecord.checkIn.verified ? 'Yes' : 'Pending'}
                          </span>
                        </div>
                        {currentRecord.checkIn.imageUrl && (
                          <div>
                            <span className="text-sm text-gray-600 block mb-2">Image:</span>
                            <img 
                              src={currentRecord.checkIn.imageUrl} 
                              alt="Check-in" 
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No check-in recorded</p>
                    )}
                  </div>

                  {/* Check-out Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Check-out Details</h4>
                    {currentRecord.checkOut?.time ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Time:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(currentRecord.checkOut.time).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Method:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {currentRecord.checkOut.method || 'face_recognition'}
                          </span>
                        </div>
                        {currentRecord.checkOut.confidence && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {(currentRecord.checkOut.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Verified:</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            currentRecord.checkOut.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {currentRecord.checkOut.verified ? 'Yes' : 'Pending'}
                          </span>
                        </div>
                        {currentRecord.checkOut.imageUrl && (
                          <div>
                            <span className="text-sm text-gray-600 block mb-2">Image:</span>
                            <img 
                              src={currentRecord.checkOut.imageUrl} 
                              alt="Check-out" 
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No check-out recorded</p>
                    )}
                  </div>
                </div>

                {currentRecord.notes && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{currentRecord.notes}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                {!currentRecord.checkIn?.verified && currentRecord.checkIn?.time && (
                  <button
                    type="button"
                    onClick={() => {
                      handleVerifyAttendance(currentRecord._id, "checkIn");
                      closeDetailModal();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Verify Check-in
                  </button>
                )}
                {!currentRecord.checkOut?.verified && currentRecord.checkOut?.time && (
                  <button
                    type="button"
                    onClick={() => {
                      handleVerifyAttendance(currentRecord._id, "checkOut");
                      closeDetailModal();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Verify Check-out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
