import { Search, Filter, Calendar, Download, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const AttendanceFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  dateRange, 
  setDateRange, 
  filter, 
  setFilter,
  departments,
  onRefresh,
  onExport,
  loading 
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Top row - Search and Actions */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Date Range:</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Status:</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Verification:</label>
              <select
                value={filter.verification}
                onChange={(e) => setFilter(prev => ({ ...prev, verification: e.target.value }))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Records</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Department:</label>
              <select
                value={filter.department}
                onChange={(e) => setFilter(prev => ({ ...prev, department: e.target.value }))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AttendanceFilters
