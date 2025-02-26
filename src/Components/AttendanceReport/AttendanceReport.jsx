"use client"

import { useState, useEffect } from "react"
import { UserIcon, CalendarDaysIcon, ChartBarIcon } from "../Icons/Icons"
import { CheckIcon, XMarkIcon } from "../Icons/Icons"
import StatCard from "../Card/StatCard"

const AttendanceReport = () => {
  // Department, semester, and section states
  const [departments, setDepartments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState("")

  const [semesters, setSemesters] = useState([])
  const [selectedSemester, setSelectedSemester] = useState("")

  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState("")

  // Course and student states
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")

  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Attendance data states
  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  })

  // Load departments on component mount
  useEffect(() => {
    // Simulate loading departments
    setDepartments([
      { id: "CSE", name: "Computer Science & Engineering" },
      { id: "EEE", name: "Electrical & Electronic Engineering" },
      { id: "BBA", name: "Business Administration" },
      { id: "ENG", name: "English" },
    ])
  }, [])

  // Load semesters when department is selected
  useEffect(() => {
    if (selectedDepartment) {
      // Simulate loading semesters for the selected department
      setSemesters([
        { id: "1", name: "1st Semester" },
        { id: "2", name: "2nd Semester" },
        { id: "3", name: "3rd Semester" },
        { id: "4", name: "4th Semester" },
        { id: "5", name: "5th Semester" },
        { id: "6", name: "6th Semester" },
        { id: "7", name: "7th Semester" },
        { id: "8", name: "8th Semester" },
      ])
      // Reset subsequent selections
      setSelectedSemester("")
      setSelectedSection("")
      setSelectedCourse("")
      setSelectedStudent(null)
      setSections([])
      setCourses([])
      setStudents([])
    } else {
      setSemesters([])
    }
  }, [selectedDepartment])

  // Load sections when semester is selected
  useEffect(() => {
    if (selectedDepartment && selectedSemester) {
      // Simulate loading sections for the selected semester
      setSections([
        { id: "A", name: "Section A" },
        { id: "B", name: "Section B" },
        { id: "C", name: "Section C" },
      ])
      // Reset subsequent selections
      setSelectedSection("")
      setSelectedCourse("")
      setSelectedStudent(null)
      setCourses([])
      setStudents([])
    } else {
      setSections([])
    }
  }, [selectedDepartment, selectedSemester])

  // Load courses when section is selected
  useEffect(() => {
    if (selectedDepartment && selectedSemester && selectedSection) {
      // Simulate loading courses for the selected section
      setCourses([
        { id: `${selectedDepartment}-101`, name: "Introduction to Computer Science" },
        { id: `${selectedDepartment}-201`, name: "Data Structures and Algorithms" },
        { id: `${selectedDepartment}-305`, name: "Database Systems" },
        { id: `${selectedDepartment}-401`, name: "Artificial Intelligence" },
      ])
      // Reset subsequent selections
      setSelectedCourse("")
      setSelectedStudent(null)
      setStudents([])
    } else {
      setCourses([])
    }
  }, [selectedDepartment, selectedSemester, selectedSection])

  // Load students when course is selected
  useEffect(() => {
    if (selectedCourse) {
      // Simulate loading students for the selected course
      const mockStudents = [
        {
          id: `${selectedDepartment}-${selectedSemester}-001`,
          name: "Sheikh Shadia",
          email: "sheikhshadia20045@gmail.com",
          phone: "01712345678",
        },
        {
          id: `${selectedDepartment}-${selectedSemester}-002`,
          name: "Md. Shahriar Fardous",
          email: "shahairarfardows@gmail.com",
          phone: "01812345678",
        },
        {
          id: `${selectedDepartment}-${selectedSemester}-003`,
          name: "Farhan Ahmed",
          email: "farhan@example.com",
          phone: "01912345678",
        },
        {
          id: `${selectedDepartment}-${selectedSemester}-004`,
          name: "Nusrat Jahan",
          email: "nusrat@example.com",
          phone: "01612345678",
        },
        {
          id: `${selectedDepartment}-${selectedSemester}-005`,
          name: "Omar Farooq",
          email: "omar@example.com",
          phone: "01512345678",
        },
        {
          id: `${selectedDepartment}-${selectedSemester}-006`,
          name: "Rabeya Khatun",
          email: "rabeya@example.com",
          phone: "01312345678",
        },
        {
          id: `${selectedDepartment}-${selectedSemester}-007`,
          name: "Sadia Islam",
          email: "sadia@example.com",
          phone: "01412345678",
        },
        {
          id: `${selectedDepartment}-${selectedSemester}-008`,
          name: "Tanvir Hossain",
          email: "tanvir@example.com",
          phone: "01612345679",
        },
      ]
      setStudents(mockStudents)
    } else {
      setStudents([])
    }
  }, [selectedCourse, selectedDepartment, selectedSemester])

  // Load attendance data when student is selected
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

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    return (
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Student Attendance Report</h1>
      </div>

      {/* Filter section at the top */}
      <div className="lg:bg-white lg:rounded-xl lg:shadow-md lg:overflow-hidden lg:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={!selectedDepartment}
            >
              <option value="">Select a semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedSemester}
            >
              <option value="">Select a section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value)
                setSelectedStudent(null)
              }}
              disabled={!selectedSection}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.id} - {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student list and details section */}
      {selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 lg:bg-white lg:rounded-xl lg:shadow-md lg:overflow-hidden">
            <div className="lg:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Student List</h2>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search students by id or name..."
                  className="peer h-10 w-full rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
            </div>
          </div>

          <div className="lg:col-span-2 lg:bg-white lg:rounded-xl lg:shadow-md lg:overflow-hidden">
            {selectedStudent ? (
              <div className="lg:p-6">
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
      )}
    </div>
  )
}

export default AttendanceReport

