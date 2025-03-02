"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FaUserGraduate, FaUserCheck, FaUserTimes, FaChartLine } from "react-icons/fa"
import StatCard from "../Components/Card/StatCard"
import useAuthContext from "../Auth/Context/useAuthContext"
import { Contexts } from "../Auth/Context/Context"
import LoadingSpinner from "../Shared/LoadingSpinner"

export default function Dashboard() {
  const [teacher, setTeacher] = useState(null)
  const [attendance, setAttendance] = useState([])
  console.log(attendance.length ? [{ name: "CSE", age: "N/A" }] : attendance);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  })
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([])

  
  // Assuming we get the logged-in user's email from Firebase Auth
  const {user} = useAuthContext(Contexts)
  const loggedInEmail = user?.email // This would come from your Firebase auth

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teacher data
        const teacherResponse = await fetch("https://attandance-production.up.railway.app/api/getTeacher")
        const teacherData = await teacherResponse.json()
        const currentTeacher = teacherData.find((t) => t.email === loggedInEmail)
        setTeacher(currentTeacher)

        // Fetch attendance data
        const attendanceResponse = await fetch("https://attandance-production.up.railway.app/api/Attendance")
        const attendanceData = await attendanceResponse.json()

        // Extract attendance records from nested data structure
        const allAttendanceRecords = attendanceData.reduce((acc, record) => {
          return [...acc, ...record.data]
        }, [])

        // Filter attendance data for the current teacher
        const teacherAttendance = allAttendanceRecords.filter((a) => a.teacherEmail === loggedInEmail)
        setAttendance(teacherAttendance)

        // Calculate statistics
        if (currentTeacher) {
          calculateStats(teacherAttendance)
        }

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch data")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, [loggedInEmail])

  const calculateStats = (attendanceData) => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]

    // Filter attendance records for today
    const todayAttendance = attendanceData.filter((a) => a.date === today)

    // Count present and absent students today
    const presentToday = todayAttendance.filter((a) => a.status === "present").length
    const absentToday = todayAttendance.filter((a) => a.status === "absent").length

    // Calculate total students
    const totalStudents = new Set(attendanceData.map((a) => a.studentId)).size

    // Calculate attendance rate
    const attendanceRate =
      presentToday + absentToday > 0 ? Math.round((presentToday / (presentToday + absentToday)) * 100) : 0

    setStats({
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
    })

    // Calculate attendance per student
    const studentAttendanceMap = {}

    // Initialize with all students
    const uniqueStudents = [...new Set(attendanceData.map((record) => record.studentId))]
    uniqueStudents.forEach((studentId) => {
      const studentRecord = attendanceData.find((record) => record.studentId === studentId)
      studentAttendanceMap[studentId] = {
        studentId: studentId,
        name: studentRecord.name,
        department: studentRecord.department,
        semester: studentRecord.semester,
        section: studentRecord.section,
        totalClasses: 0,
        presentCount: 0,
        absentCount: 0,
        attendanceRate: 0,
      }
    })

    // Count attendance for each student
    attendanceData.forEach((record) => {
      const studentId = record.studentId
      if (studentAttendanceMap[studentId]) {
        studentAttendanceMap[studentId].totalClasses++
        if (record.status === "present") {
          studentAttendanceMap[studentId].presentCount++
        } else {
          studentAttendanceMap[studentId].absentCount++
        }
      }
    })

    // Calculate attendance rate and filter students with absences
    const studentsWithAbsences = Object.values(studentAttendanceMap)
      .map((student) => {
        student.attendanceRate = Math.round((student.presentCount / student.totalClasses) * 100)
        return student
      })
      .filter((student) => student.absentCount > 0) // Only include students with absences
      .sort((a, b) => {
        // First sort by absent count (highest first)
        if (b.absentCount !== a.absentCount) {
          return b.absentCount - a.absentCount
        }
        // If absent counts are equal, sort by attendance rate (lowest first)
        return a.attendanceRate - b.attendanceRate
      })
      .slice(0, 5) // Take top 5 most absent students

    // Add debug logging
    console.log(
      "Students with absences:",
      studentsWithAbsences.map((s) => ({
        name: s.name,
        absences: s.absentCount,
        rate: s.attendanceRate,
      })),
    )

    setLowAttendanceStudents(studentsWithAbsences)
  }

  if (loading) return <LoadingSpinner/>
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  if (!teacher) return <div className="flex justify-center items-center h-screen">Teacher not found</div>

  // Prepare chart data
  const chartData = lowAttendanceStudents.map((student) => ({
    name: student.name,
    attendanceRate: student.attendanceRate,
  }))

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <div className="flex items-center mt-2">
            <div className="mr-2 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {teacher.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold">{teacher.name}</p>
              <p className="text-sm text-gray-600">{teacher.subject} Teacher</p>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<FaUserGraduate className="text-blue-500" size={24} />}
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={<FaUserCheck className="text-green-500" size={24} />}
            bgColor="bg-green-100"
          />
          <StatCard
            title="Absent Today"
            value={stats.absentToday}
            icon={<FaUserTimes className="text-red-500" size={24} />}
            bgColor="bg-red-100"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<FaChartLine className="text-purple-500" size={24} />}
            bgColor="bg-purple-100"
          />
        </div>

        {/* Low Attendance Students */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Low Attendance Students</h2>

          <div className="mb-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendanceRate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Department</th>
                  <th className="py-2 px-4 text-left">Semester</th>
                  <th className="py-2 px-4 text-left">Section</th>
                  <th className="py-2 px-4 text-left">Absences</th>
                  <th className="py-2 px-4 text-left">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {lowAttendanceStudents.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{student.name}</td>
                    <td className="py-2 px-4">{student.studentId}</td>
                    <td className="py-2 px-4">{student.department}</td>
                    <td className="py-2 px-4">{student.semester}</td>
                    <td className="py-2 px-4">{student.section}</td>
                    <td className="py-2 px-4 font-semibold text-red-600">{student.absentCount} classes</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              student.attendanceRate < 50
                                ? "bg-red-500"
                                : student.attendanceRate < 75
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${student.attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{student.attendanceRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
