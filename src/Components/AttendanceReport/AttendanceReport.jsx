import { useState, useEffect, useRef } from "react"
import { UserIcon, CalendarDaysIcon, ChartBarIcon,  PrinterIcon } from "../Icons/Icons"
import { CheckIcon, XMarkIcon } from "../Icons/Icons"
import StatCard from "../Card/StatCard"

const AttendanceReport= () => {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  })
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    // Simulate loading courses
    setCourses([
      { id: "CSE-101", name: "Introduction to Computer Science" },
      { id: "CSE-201", name: "Data Structures and Algorithms" },
      { id: "CSE-305", name: "Database Systems" },
      { id: "CSE-401", name: "Artificial Intelligence" },
    ])
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      // Simulate loading students for the selected course
      const mockStudents = [
        { id: "2020-CS-001", name: "Sheikh Shadia", email: "sheikhshadia20045@gmail.com", phone: "01712345678" },
        { id: "2020-CS-002", name: "Md. Shahriar Fardous", email: "shahairarfardows@gmail.com", phone: "01812345678" },
        { id: "2020-CS-003", name: "Farhan Ahmed", email: "farhan@example.com", phone: "01912345678" },
        { id: "2020-CS-004", name: "Nusrat Jahan", email: "nusrat@example.com", phone: "01612345678" },
        { id: "2020-CS-005", name: "Omar Farooq", email: "omar@example.com", phone: "01512345678" },
        { id: "2020-CS-006", name: "Rabeya Khatun", email: "rabeya@example.com", phone: "01312345678" },
        { id: "2020-CS-007", name: "Sadia Islam", email: "sadia@example.com", phone: "01412345678" },
        { id: "2020-CS-008", name: "Tanvir Hossain", email: "tanvir@example.com", phone: "01612345679" },
      ]
      setStudents(mockStudents)
    } else {
      setStudents([])
    }
  }, [selectedCourse])

  useEffect(() => {
    if (selectedStudent) {
      // Simulate loading attendance data for the selected student
      const mockAttendanceData = [
        { date: "2023-11-15", status: "present", notes: "" },
        { date: "2023-11-14", status: "present", notes: "" },
        { date: "2023-11-13", status: "absent", notes: "Sick leave" },
        { date: "2023-11-10", status: "present", notes: "" },
        { date: "2023-11-09", status: "present", notes: "" },
        { date: "2023-11-08", status: "present", notes: "" },
        { date: "2023-11-07", status: "absent", notes: "" },
        { date: "2023-11-06", status: "present", notes: "" },
        { date: "2023-11-03", status: "present", notes: "" },
        { date: "2023-11-02", status: "present", notes: "" },
        { date: "2023-11-01", status: "present", notes: "" },
        { date: "2023-10-31", status: "absent", notes: "" },
      ]

      setAttendanceData(mockAttendanceData)

      // Calculate attendance statistics
      const totalClasses = mockAttendanceData.length
      const presentCount = mockAttendanceData.filter((record) => record.status === "present").length
      const absentCount = totalClasses - presentCount
      const percentage = (presentCount / totalClasses) * 100

      setAttendanceStats({
        totalClasses,
        present: presentCount,
        absent: absentCount,
        percentage: percentage.toFixed(1),
      })
    } else {
      setAttendanceData([])
      setAttendanceStats({
        totalClasses: 0,
        present: 0,
        absent: 0,
        percentage: 0,
      })
    }
  }, [selectedStudent])

  const filteredStudents = students.filter((student) => {
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Student Attendance Report</h1>
        {selectedStudent && (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            onClick={handlePrint}
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-1 bg-white rounded-xl shadow-md overflow-hidden ${isPrinting ? "hidden" : ""}`}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Student</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value)
                  setSelectedStudent(null)
                }}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.id} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <>
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search students by id or name..."
                    className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  </div>
                </div>

                <div className="overflow-y-auto max-h-96 border rounded-sm border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <li
                        key={student.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          selectedStudent && selectedStudent.id === student.id ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                            <p className="text-sm text-gray-500 truncate">{student.id}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className={`${isPrinting ? "w-full" : "lg:col-span-2"} bg-white rounded-xl shadow-md overflow-hidden`}
          ref={printRef}
        >
          {selectedStudent ? (
            <div className="p-6">
              {/* Print Header - Only visible when printing */}
              {isPrinting && (
                <div className="mb-8 print:block hidden">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold">AttendEase - Student Attendance Report</h1>
                    <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold">Course: {selectedCourse}</h2>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h2>
                  <p className="text-gray-500">{selectedStudent.id}</p>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 mt-1">
                    <span className="text-sm text-gray-500">{selectedStudent.email}</span>
                    <span className="text-sm text-gray-500">{selectedStudent.phone}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Total Classes"
                  value={attendanceStats.totalClasses}
                  icon={<CalendarDaysIcon className="h-6 w-6 text-blue-500" />}
                  color="blue"
                />
                <StatCard
                  title="Present"
                  value={attendanceStats.present}
                  icon={<CheckIcon className="h-6 w-6 text-green-500" />}
                  color="green"
                />
                <StatCard
                  title="Absent"
                  value={attendanceStats.absent}
                  icon={<XMarkIcon className="h-6 w-6 text-red-500" />}
                  color="red"
                />
                <StatCard
                  title="Attendance %"
                  value={`${attendanceStats.percentage}%`}
                  icon={<ChartBarIcon className="h-6 w-6 text-purple-500" />}
                  color="purple"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance History</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.status === "present" ? "Present" : "Absent"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Print Footer - Only visible when printing */}
              {isPrinting && (
                <div className="mt-8 print:block hidden">
                  <div className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
                    <p>This is an official attendance report generated by AttendEase.</p>
                    <p>For any discrepancies, please contact the administration.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center py-10">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No student selected</h3>
                <p className="mt-1 text-sm text-gray-500">Please select a student to view their attendance report.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      
    </div>
  )
}

export default AttendanceReport;