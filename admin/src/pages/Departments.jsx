import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { departmentsAPI } from '../lib/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import DepartmentStats from '../components/departments/DepartmentStats'
import DepartmentFilters from '../components/departments/DepartmentFilters'
import DepartmentCard from '../components/departments/DepartmentCard'
import DepartmentModal from '../components/departments/DepartmentModal'
import DepartmentDetailModal from '../components/departments/DepartmentDetailModal'

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalLoading, setModalLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [viewingDepartment, setViewingDepartment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    totalEmployees: 0,
    activeToday: 0,
    locations: 0
  })
  const [userCounts, setUserCounts] = useState({})

  const itemsPerPage = 9

  // Filter and paginate departments
  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [departments, searchTerm])

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredDepartments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredDepartments, currentPage])

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const response = await departmentsAPI.getAll()
      setDepartments(response.data || [])
      
      // Calculate stats
      const total = response.data?.length || 0
      const locations = new Set(response.data?.map(d => d.location).filter(Boolean)).size
      
      setStats(prev => ({
        ...prev,
        total,
        locations
      }))
    } catch (error) {
      console.error('Error fetching departments:', error)
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCounts = async () => {
    try {
      // This would typically come from the API
      // For now, simulate user counts
      const counts = {}
      departments.forEach(dept => {
        counts[dept._id] = Math.floor(Math.random() * 50) + 1
      })
      setUserCounts(counts)
      
      // Update total employees in stats
      const totalEmployees = Object.values(counts).reduce((sum, count) => sum + count, 0)
      setStats(prev => ({
        ...prev,
        totalEmployees,
        activeToday: Math.floor(totalEmployees * 0.8) // 80% active simulation
      }))
    } catch (error) {
      console.error('Error fetching user counts:', error)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (departments.length > 0) {
      fetchUserCounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments.length])

  const handleCreateNew = () => {
    setEditingDepartment(null)
    setIsModalOpen(true)
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setIsModalOpen(true)
  }

  const handleSave = async (formData) => {
    setModalLoading(true)
    try {
      if (editingDepartment) {
        await departmentsAPI.update(editingDepartment._id, formData)
        toast.success('Department updated successfully')
      } else {
        await departmentsAPI.create(formData)
        toast.success('Department created successfully')
      }
      
      setIsModalOpen(false)
      setEditingDepartment(null)
      fetchDepartments()
    } catch (error) {
      console.error('Error saving department:', error)
      toast.error(error.response?.data?.message || 'Failed to save department')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return
    }

    try {
      await departmentsAPI.delete(departmentId)
      toast.success('Department deleted successfully')
      fetchDepartments()
    } catch (error) {
      console.error('Error deleting department:', error)
      toast.error(error.response?.data?.message || 'Failed to delete department')
    }
  }

  const handleViewDetails = (department) => {
    setViewingDepartment(department)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setViewingDepartment(null)
  }

  const handleRefresh = () => {
    fetchDepartments()
  }

  const handleExport = () => {
    try {
      const csvContent = departments.map(dept => 
        `${dept.name},${dept.code || ''},${dept.description || ''},${userCounts[dept._id] || 0}`
      ).join('\n')
      
      const header = 'Name,Code,Description,Employee Count\n'
      const csv = header + csvContent
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'departments.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Departments exported successfully')
    } catch (error) {
      console.error('Error exporting departments:', error)
      toast.error('Failed to export departments')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Departments</h1>
          <p className="text-muted-foreground">
            Manage organizational departments and their structure.
          </p>
        </div>
      </div>

      {/* Stats */}
      <DepartmentStats stats={stats} loading={loading} />

      {/* Filters */}
      <DepartmentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onCreateNew={handleCreateNew}
        loading={loading}
      />

      {/* Departments Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Departments
          </CardTitle>
          <CardDescription>
            {filteredDepartments.length} departments found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-48" />
              ))}
            </div>
          ) : paginatedDepartments.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {paginatedDepartments.map((department) => (
                  <DepartmentCard
                    key={department._id}
                    department={department}
                    userCount={userCounts[department._id]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
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
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
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
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No departments match your search criteria.' : 'Get started by creating your first department.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={handleCreateNew}>
                    Create Department
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Modal */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingDepartment(null)
        }}
        onSave={handleSave}
        department={editingDepartment}
        loading={modalLoading}
      />

      {/* Department Detail Modal */}
      <DepartmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        department={viewingDepartment}
        userCount={viewingDepartment ? userCounts[viewingDepartment._id] || 0 : 0}
        onEdit={(dept) => {
          handleCloseDetailModal()
          handleEdit(dept)
        }}
      />
    </div>
  )
}

export default Departments