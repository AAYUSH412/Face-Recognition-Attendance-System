import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { attendanceAPI, departmentsAPI } from '../lib/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import AttendanceStats from '../components/attendance/AttendanceStats'
import AttendanceFilters from '../components/attendance/AttendanceFilters'
import AttendanceRecord from '../components/attendance/AttendanceRecord'
import ImageViewModal from '../components/attendance/ImageViewModal'

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
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    pendingVerification: 0,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchAttendanceRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      if (filter.status) params.status = filter.status;
      if (filter.verification) params.verification = filter.verification;
      if (filter.department) params.departmentId = filter.department;
      if (searchTerm) params.search = searchTerm;

      const response = await attendanceAPI.getAll(params);
      
      setAttendanceRecords(response.data.records || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateRange, filter, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await attendanceAPI.getStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [dateRange]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
    fetchStats();
  }, [fetchAttendanceRecords, fetchStats]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleVerify = async (recordId, type) => {
    try {
      await attendanceAPI.verify(recordId, { type });
      toast.success(`${type} verified successfully`);
      fetchAttendanceRecords();
      fetchStats();
    } catch (error) {
      console.error("Error verifying record:", error);
      toast.error("Failed to verify record");
    }
  };

  const handleReject = async (recordId, type) => {
    try {
      await attendanceAPI.reject(recordId, { type });
      toast.success(`${type} rejected successfully`);
      fetchAttendanceRecords();
      fetchStats();
    } catch (error) {
      console.error("Error rejecting record:", error);
      toast.error("Failed to reject record");
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    
    try {
      await attendanceAPI.delete(recordId);
      toast.success('Record deleted successfully');
      fetchAttendanceRecords();
      fetchStats();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...filter
      };
      
      const response = await attendanceAPI.export(params);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  const handleRefresh = () => {
    fetchAttendanceRecords();
    fetchStats();
  };

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Attendance Records</h1>
          <p className="text-muted-foreground">
            Monitor and verify attendance records with comprehensive filtering and analytics.
          </p>
        </div>
      </div>

      {/* Stats */}
      <AttendanceStats stats={stats} loading={loading} />

      {/* Filters */}
      <AttendanceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
        filter={filter}
        setFilter={setFilter}
        departments={departments}
        onRefresh={handleRefresh}
        onExport={handleExport}
        loading={loading}
      />

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>
            {attendanceRecords.length} records found for the selected criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-32" />
              ))}
            </div>
          ) : attendanceRecords.length > 0 ? (
            <div className="divide-y">
              {attendanceRecords.map((record) => (
                <div key={record._id} className="p-6">
                  <AttendanceRecord
                    record={record}
                    onVerify={handleVerify}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    onViewImage={handleViewImage}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No attendance records match your current search and filter criteria.
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image View Modal */}
      <ImageViewModal
        imageUrl={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default Attendance;
