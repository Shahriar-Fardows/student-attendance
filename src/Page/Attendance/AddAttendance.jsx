import { useState, useEffect } from "react"
import { FaUserCog, FaFileUpload } from "react-icons/fa"
import * as XLSX from "xlsx"

function AttendanceForm() {
  const [mode, setMode] = useState("register") // register, uploadStudents, uploadAttendance
  const [loading, setLoading] = useState(false)
  const [teacher, setTeacher] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

  const [newStudent, setNewStudent] = useState({
    studentId: "",
    name: "",
    department: "CSE",
    semester: "1",
    section: "1",
    mobileNumber: "",
    email: "",
    status: "present", // Added attendance status
    date: new Date().toISOString().split("T")[0], // Today's date for attendance
  })

  // Predefined options
  const departments = ["CSE", "EEE", "CIVIL", "BBA", "ENGLISH", "LLB", "ECONOMICS"]
  const semesterOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  const sectionOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString())

  // Student list upload state
  const [uploadConfig, setUploadConfig] = useState({
    department: "CSE",
    semester: "1",
    section: "1",
  })

  // API endpoints with fallback
  const STUDENT_APIS = ["https://sheetdb.io/api/v1/ja0l8nz04bsok", "https://sheetdb.io/api/v1/8nv4w9rg5hjjp"]
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
      const currentTeacher = teachers.find((t) => t.email === loggedInEmail)

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
    if (!newStudent.studentId || !newStudent.name) {
      setError("Student ID and Name are required")
      return
    }

    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      // First, register the student
      const studentData = {
        studentId: newStudent.studentId,
        name: newStudent.name,
        department: newStudent.department,
        semester: newStudent.semester,
        section: newStudent.section,
        mobileNumber: newStudent.mobileNumber,
        email: newStudent.email,
      }

      // Try first API for student registration
      let response = await fetch(STUDENT_APIS[currentApiIndex], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      })

      // If first API fails, try second API
      if (!response.ok && currentApiIndex < STUDENT_APIS.length - 1) {
        setCurrentApiIndex((prev) => prev + 1)
        response = await fetch(STUDENT_APIS[currentApiIndex + 1], {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to register student")
      }

      // Then, submit attendance if student registration was successful
      const attendanceData = {
        date: newStudent.date,
        studentId: newStudent.studentId,
        name: newStudent.name,
        department: newStudent.department,
        semester: newStudent.semester,
        section: newStudent.section,
        status: newStudent.status,
        teacherEmail: teacher?.email,
        subject: teacher?.subject,
      }

      const attendanceResponse = await fetch("https://attandance-production.up.railway.app/api/Attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [attendanceData],
        }),
      })

      if (!attendanceResponse.ok) {
        throw new Error("Failed to submit attendance")
      }

      setSuccessMessage("Student registered and attendance recorded successfully!")
      setNewStudent({
        studentId: "",
        name: "",
        department: "CSE",
        semester: "1",
        section: "1",
        mobileNumber: "",
        email: "",
        status: "present",
        date: new Date().toISOString().split("T")[0],
      })
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "Failed to complete registration")
    } finally {
      setLoading(false)
    }
  }

  const handleStudentListUpload = async (event) => {
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

      // Add selected department, semester, section to each record
      const enrichedData = data.map((row) => ({
        studentId: row.ID || row["Student ID"] || "",
        name: row.Name || "",
        department: uploadConfig.department,
        semester: uploadConfig.semester,
        section: uploadConfig.section,
        mobileNumber: row.Mobile || "",
        email: row.Email || "",
      }))

      // Validate required fields
      const invalidRecords = enrichedData.filter((record) => !record.studentId || !record.name)

      if (invalidRecords.length) {
        throw new Error(`${invalidRecords.length} records are missing required fields`)
      }

      // Submit each student record
      for (const student of enrichedData) {
        let response = await fetch(STUDENT_APIS[currentApiIndex], {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(student),
        })

        if (!response.ok && currentApiIndex < STUDENT_APIS.length - 1) {
          setCurrentApiIndex((prev) => prev + 1)
          response = await fetch(STUDENT_APIS[currentApiIndex + 1], {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(student),
          })
        }

        if (!response.ok) {
          throw new Error(`Failed to register student: ${student.name}`)
        }
      }

      setSuccessMessage(`Successfully registered ${enrichedData.length} students!`)
    } catch (err) {
      console.error("Error processing file:", err)
      setError("Failed to process file: " + err.message)
    } finally {
      setLoading(false)
      event.target.value = null // Reset file input
    }
  }

  const handleAttendanceUpload = async (event) => {
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

      // Process attendance records - keep original date
      const attendanceRecords = data.map((row) => ({
        date: row.date || row.Date || new Date().toISOString().split("T")[0],
        studentId: row.studentId || row["Student ID"] || "",
        name: row.name || row["Name"] || "",
        department: row.department || row["Department"] || "",
        semester: row.semester || row["Semester"] || "",
        section: row.section || row["Section"] || "",
        status: (row.status || row["Status"] || "present").toLowerCase(),
        teacherEmail: teacher?.email,
        subject: teacher?.subject,
      }))

      // Submit attendance records
      const response = await fetch("https://attandance-production.up.railway.app/api/Attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: attendanceRecords,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit attendance")
      }

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

  if (loading && !teacher) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !teacher) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className=" mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
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
                onClick={() => setMode("register")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  mode === "register" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaUserCog /> Register Student
              </button>
              <button
                onClick={() => setMode("uploadStudents")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  mode === "uploadStudents" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaFileUpload /> Upload Student List
              </button>
              <button
                onClick={() => setMode("uploadAttendance")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  mode === "uploadAttendance" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FaFileUpload /> Upload Attendance
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && <div className="bg-green-50 text-green-800 rounded-lg p-4 mb-6">{successMessage}</div>}
          {error && <div className="bg-red-50 text-red-800 rounded-lg p-4 mb-6">{error}</div>}

          {/* Forms */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {mode === "register" ? (
              // Student Registration Form with Attendance
              <div>
                <h2 className="text-xl font-semibold mb-6">Register New Student</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID*</label>
                    <input
                      type="text"
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, studentId: e.target.value }))}
                      placeholder="Enter student ID"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                    <input
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter student name"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={newStudent.department}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      value={newStudent.semester}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, semester: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {semesterOptions.map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={newStudent.section}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, section: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sectionOptions.map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={newStudent.mobileNumber}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
                    <input
                      type="date"
                      value={newStudent.date}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Status</label>
                    <select
                      value={newStudent.status}
                      onChange={(e) => setNewStudent((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
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
            ) : mode === "uploadStudents" ? (
              // Student List Upload Form
              <div>
                <h2 className="text-xl font-semibold mb-6">Upload Student List</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={uploadConfig.department}
                      onChange={(e) => setUploadConfig((prev) => ({ ...prev, department: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      value={uploadConfig.semester}
                      onChange={(e) => setUploadConfig((prev) => ({ ...prev, semester: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {semesterOptions.map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={uploadConfig.section}
                      onChange={(e) => setUploadConfig((prev) => ({ ...prev, section: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {sectionOptions.map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      onChange={handleStudentListUpload}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      id="student-file-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="student-file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FaFileUpload className="text-4xl text-gray-400 mb-4" />
                      <span className="text-gray-600">
                        {loading ? "Processing..." : "Click to upload student list"}
                      </span>
                      <span className="text-sm text-gray-500 mt-2">Supports Excel and CSV files</span>
                    </label>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">File Format Requirements:</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      <li>File must be Excel (.xlsx, .xls) or CSV format</li>
                      <li>Required columns: ID, Name, Mobile, Email</li>
                      <li>Department, Semester, and Section will be added from the selections above</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              // Attendance Upload Form
              <div>
                <h2 className="text-xl font-semibold mb-6">Upload Attendance Spreadsheet</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      onChange={handleAttendanceUpload}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      id="attendance-file-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="attendance-file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FaFileUpload className="text-4xl text-gray-400 mb-4" />
                      <span className="text-gray-600">{loading ? "Processing..." : "Click to upload attendance"}</span>
                      <span className="text-sm text-gray-500 mt-2">Supports Excel and CSV files</span>
                    </label>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">File Format Requirements:</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      <li>File must be Excel (.xlsx, .xls) or CSV format</li>
                      <li>Required columns: Date, Student ID, Name, Department, Semester, Section, Status</li>
                      <li>Status should be either &quot;present&quot; or &quot;absent&quot;</li>
                      <li>Date format should be YYYY-MM-DD</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceForm

