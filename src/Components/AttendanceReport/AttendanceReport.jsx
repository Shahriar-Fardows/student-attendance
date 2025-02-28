import { useState, useEffect } from "react"
import Swal from "sweetalert2"

const AttendanceCorrectionPage = () => {
  const [teacher, setTeacher] = useState(null)
  const [students, setStudents] = useState([])
  console.log(students)
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch teacher data
        const teacherResponse = await fetch("https://sheetdb.io/api/v1/euy38wx992nlx")
        const teacherData = await teacherResponse.json()
        setTeacher(teacherData[0]) // Assuming the first teacher in the list

        // Fetch student data
        const studentResponse = await fetch("https://sheetdb.io/api/v1/ja0l8nz04bsok")
        const studentData = await studentResponse.json()
        setStudents(studentData)

        // Fetch attendance data
        const attendanceResponse = await fetch("https://sheetdb.io/api/v1/h8958x35wbymx")
        const attendanceData = await attendanceResponse.json()
        setAttendanceData(attendanceData)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to fetch data. Please try again later.",
        })
      }
    }

    fetchData()
  }, [])

  const handleSearch = () => {
    if (!searchTerm) return

    const filteredAttendance = attendanceData.filter(
      (item) =>
        item.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Group the filtered attendance by student
    const groupedAttendance = filteredAttendance.reduce((acc, item) => {
      if (!acc[item.studentId]) {
        acc[item.studentId] = {
          studentId: item.studentId,
          name: item.name,
          attendance: [],
        }
      }
      acc[item.studentId].attendance.push({
        id: item.id, // Include the id in the attendance record
        date: item.date,
        status: item.status,
      })
      return acc
    }, {})

    const resultsWithStats = Object.values(groupedAttendance).map((student) => {
      const stats = calculateAttendanceStats(student.attendance)
      return { ...student, ...stats }
    })

    setSearchResults(resultsWithStats)
    console.log("Search Results:", resultsWithStats) // Debug log
  }

  const calculateAttendanceStats = (attendance) => {
    const totalClasses = attendance.length
    const presentClasses = attendance.filter((att) => att.status === "present").length
    const absentClasses = totalClasses - presentClasses
    const attendancePercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : "0.00"

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      attendancePercentage,
    }
  }

  const handleAttendanceChange = (studentId, date, newStatus) => {
    setAttendanceData((prevData) =>
      prevData.map((item) =>
        item.studentId === studentId && item.date === date ? { ...item, status: newStatus } : item,
      ),
    )
    setSearchResults((prevResults) =>
      prevResults.map((student) => {
        if (student.studentId === studentId) {
          const updatedAttendance = student.attendance.map((att) =>
            att.date === date ? { ...att, status: newStatus } : att,
          )
          const updatedStats = calculateAttendanceStats(updatedAttendance)
          return {
            ...student,
            attendance: updatedAttendance,
            ...updatedStats,
          }
        }
        return student
      }),
    )
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      console.log("Before filtering:", attendanceData) // Debug log

      // Collect all modified attendance records
      const correctedData = attendanceData.filter((item) =>
        searchResults.some(
          (result) =>
            result.studentId === item.studentId &&
            result.attendance.some((att) => att.date === item.date && att.status !== item.status),
        ),
      )
      

      console.log("Corrected Data:", correctedData) // Debug log

      if (correctedData.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Changes",
          text: "No attendance records were modified.",
        })
        setSubmitting(false)
        return
      }

      const updateData = Array.isArray(correctedData) 
  ? correctedData.map((item) => ({
      id: item.id,
      status: item.status,
    }))
  : [];


      console.log("Sending to SheetDB:", updateData) // Debug log

      // Submit to SheetDB
      const response = await fetch("https://sheetdb.io/api/v1/h8958x35wbymx", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: updateData,
        }),
      })
      

      const responseData = await response.json()
      console.log("SheetDB API Response:", responseData) // Debug log

      if (response.ok && responseData.updated) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Attendance corrections submitted successfully. ${responseData.updated} rows were updated.`,
        })
        // Refresh the attendance data after successful update
        const attendanceResponse = await fetch("https://sheetdb.io/api/v1/h8958x35wbymx")
        const newAttendanceData = await attendanceResponse.json()
        setAttendanceData(newAttendanceData)
        handleSearch() // Refresh the search results
      } else {
        throw new Error("Failed to update attendance records.")
      }
    } catch (error) {
      console.error("Error submitting corrections:", error)
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Failed to submit attendance corrections: ${error.message}`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrintReport = (student) => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Report - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 150px; }
            h1 { color: #2c3e50; }
            .stats { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .stat-item { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #3498db; }
            .stat-label { font-size: 14px; color: #7f8c8d; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/PU_Logo_02.png/330px-PU_Logo_02.png" alt="University Logo" class="logo">
              <h1>Attendance Report</h1>
            </div>
            <h2>${student.name} (ID: ${student.studentId})</h2>
            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">${student.totalClasses}</div>
                <div class="stat-label">Total Classes</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${student.presentClasses}</div>
                <div class="stat-label">Present</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${student.absentClasses}</div>
                <div class="stat-label">Absent</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${student.attendancePercentage}%</div>
                <div class="stat-label">Attendance Percentage</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${student.attendance
                  .map(
                    (att) => `
                  <tr>
                    <td>${att.date}</td>
                    <td>${att.status}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Attendance Correction</h1>
          {teacher && (
            <p className="text-base sm:text-lg text-gray-600">
              Teacher: {teacher.name} | Subject: {teacher.subject}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search Student (ID or Name)
                  </label>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter student ID or name"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Student Attendance List */}
            {searchResults.length > 0 && (
              <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Attendance Records</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Search Results: {searchResults.length} student(s)
                  </p>
                </div>

                {searchResults.map((student) => (
                  <div key={student.studentId} className="border-b border-gray-200 last:border-b-0">
                    <div className="px-4 py-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-md font-medium text-gray-900">
                          {student.name} (ID: {student.studentId})
                        </h4>
                        <button
                          onClick={() => handlePrintReport(student)}
                          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none"
                        >
                          Print Report
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total Classes:</span> {student.totalClasses}
                        </div>
                        <div>
                          <span className="font-medium">Present:</span> {student.presentClasses}
                        </div>
                        <div>
                          <span className="font-medium">Absent:</span> {student.absentClasses}
                        </div>
                        <div>
                          <span className="font-medium">Attendance:</span> {student.attendancePercentage}%
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Date
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Correct Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {student.attendance.map((att) => (
                            <tr key={att.studentId}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {att.date}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{att.status}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                <select
                                  value={att.status}
                                  onChange={(e) => handleAttendanceChange(student.studentId, att.date, e.target.value)}
                                  className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                  <option value="present">Present</option>
                                  <option value="absent">Absent</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Submit Button */}
                <div className="px-4 py-3 bg-gray-50 sm:px-6">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        submitting
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Corrections"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AttendanceCorrectionPage

