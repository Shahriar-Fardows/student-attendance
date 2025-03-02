import { useState, useEffect } from "react"
import { FaPlus, FaUserPlus, FaUsers, FaCalendarAlt, FaFileUpload, FaUserCog } from "react-icons/fa"
import * as XLSX from 'xlsx'

function AttendanceForm() {
  const [mode, setMode] = useState("bulk")
  const [loading, setLoading] = useState(false)
  const [teacher, setTeacher] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")
  const [bulkAttendance, setBulkAttendance] = useState([])
  const [individualStudent, setIndividualStudent] = useState({
    studentId: "",
    name: "",
    department: "",
    semester: "",
    section: "",
    status: "present"
  })
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    name: "",
    department: "",
    semester: "",
    section: "",
    mobileNumber: "",
    email: ""
  })

  // API endpoints with fallback
  const STUDENT_APIS = [
    "https://sheetdb.io/api/v1/ja0l8nz04bsok",
    "https://sheetdb.io/api/v1/8nv4w9rg5hjjp"
  ]
  const [currentApiIndex, setCurrentApiIndex] = useState(0)

  // Assuming we get the logged-in user's email from your auth system
  const loggedInEmail = "shahriarfardows@gmail.com"

  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://attandance-production.up.railway.app/api/getTeacher")
      if (!response.ok) throw new Error("Failed to fetch teacher data")
      
      const teachers = await response.json()
      const currentTeacher = teachers.find(t => t.email === loggedInEmail)
      
      if (!currentTeacher) {
        throw new Error("Teacher not found")
      }
      
      setTeacher(currentTeacher)
    } catch (err) {
      setError(err.message || "Failed to load teacher data")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterStudent = async () => {
    // Validate required fields
    if (!newStudent.studentId || !newStudent.name) {
      setError("Student ID and Name are required")
      return
    }

    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      // Try first API
      let response = await fetch(STUDENT_APIS[currentApiIndex], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      })

      // If first API fails, try second API
      if (!response.ok) {
        if (currentApiIndex < STUDENT_APIS.length - 1) {
          setCurrentApiIndex(prev => prev + 1)
          response = await fetch(STUDENT_APIS[currentApiIndex + 1], {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newStudent),
          })
        }
      }

      if (!response.ok) {
        throw new Error("Failed to register student")
      }

      setSuccessMessage("Student registered successfully!")
      setNewStudent({
        studentId: "",
        name: "",
        department: "",
        semester: "",
        section: "",
        mobileNumber: "",
        email: ""
      })
    } catch (err) {
      console.error("Error registering student:", err)
      setError("Failed to register student. API limit might be reached.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      const data = await readExcelFile(file)
      if (!data || !data.length) {
        throw new Error("No data found in file")
      }

      // Process attendance records
      const attendanceRecords = data.map(row => ({
        date: selectedDate,
        studentId: row.studentId || row["Student ID"] || "",
        name: row.name || row["Name"] || "",
        department: row.department || row["Department"] || "",
        semester: row.semester || row["Semester"] || "",
        section: row.section || row["Section"] || "",
        status: (row.status || row["Status"] || "present").toLowerCase(),
        teacherEmail: teacher?.email,
        subject: teacher?.subject
      }))

      // Validate records
      const invalidRecords = attendanceRecords.filter(
        record => !record.studentId || !record.name
      )

      if (invalidRecords.length) {
        throw new Error(`${invalidRecords.length} records are missing required fields`)
      }

      // Submit attendance records
      await handleSubmitAttendance(attendanceRecords)
      setSuccessMessage("Attendance data uploaded successfully!")
    } catch (err) {
      console.error("Error processing file:", err)
      setError("Failed to process file: " + err.message)
    } finally {
      setLoading(false)
      event.target.value = null // Reset file input
    }
  }

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData)
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
          reject(new Error("Invalid file format"))
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsBinaryString(file)
    })
  }

  const handleBulkStatusChange = (studentId, status) => {
    setBulkAttendance(prev => 
      prev.map(student => 
        student.studentId === studentId 
          ? { ...student, status } 
          : student
      )
    )
  }

  const handleAddStudent = async () => {
    if (!individualStudent.studentId || !individualStudent.name) {
      setError("Student ID and Name are required")
      return
    }

    const attendanceRecord = {
      date: selectedDate,
      ...individualStudent,
      teacherEmail: teacher?.email,
      subject: teacher?.subject
    }

    await handleSubmitAttendance([attendanceRecord])
  }

  const handleBulkSubmit = async () => {
    if (!bulkAttendance.length) {
      setError("No attendance records to submit")
      return
    }

    // Validate all records
    const invalidRecords = bulkAttendance.filter(
      student => !student.studentId || !student.name
    )

    if (invalidRecords.length) {
      setError("All students must have an ID and Name")
      return
    }

    const attendanceRecords = bulkAttendance.map(student => ({
      date: selectedDate,
      ...student,
      teacherEmail: teacher?.email,
      subject: teacher?.subject
    }))

    await handleSubmitAttendance(attendanceRecords)
  }

  const handleSubmitAttendance = async (records) => {
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      const response = await fetch("https://attandance-production.up.railway.app/api/Attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: records
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit attendance")
      }

      setSuccessMessage("Attendance submitted successfully!")
      
      // Reset forms
      if (mode === "individual") {
        setIndividualStudent({
          studentId: "",
          name: "",
          department: "",
          semester: "",
          section: "",
          status: "present"
        })
      } else {
        setBulkAttendance([])
      }
    } catch (err) {
      console.error("Error submitting attendance:", err)
      setError("Failed to submit attendance: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const addStudentToBulk = () => {
    setBulkAttendance(prev => [...prev, {
      studentId: "",
      name: "",
      department: "",
      semester: "",
      section: "",
      status: "present"
    }])
  }

  const removeStudentFromBulk = (index) => {
    setBulkAttendance(prev => prev.filter((_, i) => i !== index))
  }

  const updateBulkStudent = (index, field, value) => {
    setBulkAttendance(prev => 
      prev.map((student, i) => 
        i === index 
          ? { ...student, [field]: value }
          : student
      )
    )
  }

  if (loading && !teacher) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !teacher) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
            {teacher && (
              <p className="text-gray-600 mt-2">
                {teacher.name} - {teacher.subject} Teacher
              </p>
            )}
          </header>

          {/* Mode Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setMode("bulk")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  mode === "bulk"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaUsers /> Bulk Entry
              </button>
              <button
                onClick={() => setMode("individual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  mode === "individual"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaUserPlus /> Individual Entry
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  mode === "register"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaUserCog /> Register Student
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  mode === "upload"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaFileUpload /> Upload Spreadsheet
              </button>
            </div>
          </div>

          {/* Date Selection (hide for register mode) */}
          {mode !== "register" && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-4">
                <FaCalendarAlt className="text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 text-green-800 rounded-lg p-4 mb-6">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-800 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Forms */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {mode === "register" ? (
              // Student Registration Form
              <div>
                <h2 className="text-xl font-semibold mb-6">Register New Student</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID*
                    </label>
                    <input
                      type="text"
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, studentId: e.target.value }))}
                      placeholder="Enter student ID"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter student name"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={newStudent.department}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter department"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={newStudent.semester}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, semester: e.target.value }))}
                      placeholder="Enter semester"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      value={newStudent.section}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, section: e.target.value }))}
                      placeholder="Enter section"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={newStudent.mobileNumber}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, mobileNumber: e.target.value }))}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleRegisterStudent}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Registering..." : "Register Student"}
                  </button>
                </div>
              </div>
            ) : mode === "upload" ? (
              // Spreadsheet Upload Form
              <div>
                <h2 className="text-xl font-semibold mb-6">Upload Attendance Spreadsheet</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      id="file-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FaFileUpload className="text-4xl text-gray-400 mb-4" />
                      <span className="text-gray-600">
                        {loading ? "Processing..." : "Click to upload spreadsheet"}
                      </span>
                      <span className="text-sm text-gray-500 mt-2">
                        Supports Excel and CSV files
                      </span>
                    </label>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">File Format Requirements:</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      <li>File must be Excel (.xlsx, .xls) or CSV format</li>
                      <li>Required columns: Student ID, Name, Department, Semester, Section, Status</li>
                      <li>Status should be either &quot;present&quot; or &quot;absent&quot;</li>
                      <li>First row should be column headers</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : mode === "individual" ? (
              // Individual Entry Form
              <div>
                <h2 className="text-xl font-semibold mb-6">Individual Attendance Entry</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={individualStudent.studentId}
                      onChange={(e) => setIndividualStudent(prev => ({ ...prev, studentId: e.target.value }))}
                      placeholder="Enter student ID"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={individualStudent.name}
                      onChange={(e) => setIndividualStudent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter student name"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={individualStudent.department}
                      onChange={(e) => setIndividualStudent(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter department"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={individualStudent.semester}
                      onChange={(e) => setIndividualStudent(prev => ({ ...prev, semester: e.target.value }))}
                      placeholder="Enter semester"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      value={individualStudent.section}
                      onChange={(e) => setIndividualStudent(prev => ({ ...prev, section: e.target.value }))}
                      placeholder="Enter section"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={individualStudent.status}
                      onChange={(e) => setIndividualStudent(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleAddStudent}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Attendance"}
                  </button>
                </div>
              </div>
            ) : (
              // Bulk Entry Form
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Bulk Attendance Entry</h2>
                  <button
                    onClick={addStudentToBulk}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <FaPlus /> Add Student
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left">Student ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Department</th>
                        <th className="py-3 px-4 text-left">Semester</th>
                        <th className="py-3 px-4 text-left">Section</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkAttendance.map((student, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={student.studentId}
                              onChange={(e) => updateBulkStudent(index, "studentId", e.target.value)}
                              placeholder="Student ID"
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={student.name}
                              onChange={(e) => updateBulkStudent(index, "name", e.target.value)}
                              placeholder="Name"
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={student.department}
                              onChange={(e) => updateBulkStudent(index, "department", e.target.value)}
                              placeholder="Department"
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={student.semester}
                              onChange={(e) => updateBulkStudent(index, "semester", e.target.value)}
                              placeholder="Semester"
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={student.section}
                              onChange={(e) => updateBulkStudent(index, "section", e.target.value)}
                              placeholder="Section"
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <select
                              value={student.status}
                              onChange={(e) => handleBulkStatusChange(student.studentId, e.target.value)}
                              className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                            </select>
                          </td>
                          <td className="py-2 px-4">
                            <button
                              onClick={() => removeStudentFromBulk(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {bulkAttendance.length > 0 && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleBulkSubmit}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Attendance"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceForm
