
import { useState, useEffect } from "react"
import LoadingSpinner from "../../Shared/LoadingSpinner"

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    section: "",
    search: "",
  })
  const [editingStudent, setEditingStudent] = useState(null)
  const [uniqueValues, setUniqueValues] = useState({
    departments: [],
    semesters: [],
    sections: [],
  })

  // Fetch students data
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch("https://sheetdb.io/api/v1/ja0l8nz04bsok")
      const data = await response.json()

      // Clean the data
      const cleanedData = data.map((student) => ({
        studentId: student["studentId "]?.trim() || student.studentId?.trim() || "",
        name: student.name?.trim() || "",
        department: student["depertment "]?.trim() || student.depertment?.trim() || "",
        semester: student.semister?.toString().trim() || "",
        section: student.section?.trim() || "",
        mobileNumber: student.mobileNumber?.trim() || "",
        email: student.email?.trim() || "",
      }))

      // Extract unique values
      const departments = [...new Set(cleanedData.map((s) => s.department))].filter(Boolean).sort()
      const semesters = [...new Set(cleanedData.map((s) => s.semester))].filter(Boolean).sort()
      const sections = [...new Set(cleanedData.map((s) => s.section))].filter(Boolean).sort()

      setUniqueValues({ departments, semesters, sections })
      setStudents(cleanedData)
      setFilteredStudents(cleanedData)
      setLoading(false)
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to fetch students data")
      setLoading(false)
    }
  }

  // Filter students
  useEffect(() => {
    if (!students.length) return

    let result = [...students]

    if (filters.department) {
      result = result.filter((student) => student.department.toLowerCase() === filters.department.toLowerCase())
    }

    if (filters.semester) {
      result = result.filter((student) => student.semester === filters.semester)
    }

    if (filters.section) {
      result = result.filter((student) => student.section.toLowerCase() === filters.section.toLowerCase())
    }

    if (filters.search) {
      result = result.filter(
        (student) =>
          student.studentId.toLowerCase().includes(filters.search.toLowerCase()) ||
          student.name.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    setFilteredStudents(result)
  }, [filters, students])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdate = async (student) => {
    try {
      // Prepare the data exactly as the API expects
      const apiData = {
        "studentId ": student.studentId,
        name: student.name,
        "depertment ": student.department,
        semister: student.semester,
        section: student.section,
        mobileNumber: student.mobileNumber,
        email: student.email,
      }

      // First, try to update using the SheetDB API format
      const response = await fetch("https://sheetdb.io/api/v1/ja0l8nz04bsok/studentId /" + student.studentId, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: apiData,
        }),
      })

      if (response.ok) {
        // Show success message
        alert("Student data updated successfully!")
        // Refresh the data
        await fetchStudents()
        // Clear editing state
        setEditingStudent(null)
      } else {
        // If update fails, show error
        throw new Error("Failed to update student data")
      }
    } catch (err) {
      console.error("Update error:", err)
      alert("Failed to update student data. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner/>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className=" ">
      {/* Header */}
      <div className="space-y-6 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Student List</h1>
        </div>
      </div>
      <div className="container mx-auto lg:px-4">
        {/* Filters */}
        <div className="lg:bg-white lg:rounded-lg lg:shadow-md lg:p-4 lg:mb-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search by ID or Name..."
                className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                onChange={handleFilterChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                name="department"
                className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                onChange={handleFilterChange}
              >
                <option value="">All Departments</option>
                {uniqueValues.departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Semester</label>
              <select
                name="semester"
                className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                onChange={handleFilterChange}
              >
                <option value="">All Semesters</option>
                {uniqueValues.semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Section</label>
              <select
                name="section"
                className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                onChange={handleFilterChange}
              >
                <option value="">All Sections</option>
                {uniqueValues.sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    {editingStudent?.studentId === student.studentId ? (
                      // Edit mode
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.studentId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editingStudent.name}
                            onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <input
                            type="text"
                            value={editingStudent.department}
                            onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <input
                            type="text"
                            value={editingStudent.semester}
                            onChange={(e) => setEditingStudent({ ...editingStudent, semester: e.target.value })}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <input
                            type="text"
                            value={editingStudent.section}
                            onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <input
                            type="text"
                            value={editingStudent.mobileNumber}
                            onChange={(e) => setEditingStudent({ ...editingStudent, mobileNumber: e.target.value })}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <input
                            type="text"
                            value={editingStudent.email}
                            onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                            className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleUpdate(editingStudent)}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-600 mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStudent(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{student.studentId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {student.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {student.section}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {student.mobileNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>
    </div>
  )
}
