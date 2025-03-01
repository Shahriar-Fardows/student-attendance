import { useEffect, useState } from "react"
import { FaChartLine, FaUserCheck, FaUserGraduate, FaUserTimes } from "react-icons/fa"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Contexts } from "../Auth/Context/Context"
import useAuthContext from "../Auth/Context/useAuthContext"
import StatCard from "../Components/Card/StatCard"
import LoadingSpinner from "../Shared/LoadingSpinner"

export default function Dashboard() {
  const {user} = useAuthContext(Contexts)
  const [teacher, setTeacher] = useState(null)
  const [students, setStudents] = useState([])
  console.log(students.length ? [{ name: "Hidden", age: "N/A" }] : students);

  const [attendance, setAttendance] = useState([])
  console.log(btoa(JSON.stringify(attendance)));

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
  const loggedInEmail = user?.email // This would come from your Firebase auth

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teacher data
        const teacherResponse = await fetch("https://attendans-server.vercel.app/api/getTeacher")
        const teacherData = await teacherResponse.json()
        const currentTeacher = teacherData.find((t) => t.email === loggedInEmail)
        setTeacher(currentTeacher)

        // Fetch student data
        const studentResponse = await fetch("https://sheetdb.io/api/v1/8nv4w9rg5hjjp")
        const studentData = await studentResponse.json()
        setStudents(studentData)

        // Fetch attendance data
        const attendanceResponse = await fetch("https://attendans-server.vercel.app/api/Attendance")
        const attendanceData = await attendanceResponse.json()

        // Filter attendance data for the current teacher
        const teacherAttendance = attendanceData.filter((a) => a.teacherEmail === loggedInEmail)
        setAttendance(teacherAttendance)

        // Calculate statistics
        if (currentTeacher) {
          calculateStats(studentData, teacherAttendance, currentTeacher)
        }

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch data")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, []) // Removed loggedInEmail from dependencies

  const calculateStats = (studentData, attendanceData, teacher) => {
    // For now, show all attendance data instead of filtering by date
    const todayAttendance = attendanceData
    console.log(btoa(JSON.stringify(teacher)));


    // Count present and absent students today
    const presentToday = todayAttendance.filter((a) => a.status === "present").length
    const absentToday = todayAttendance.filter((a) => a.status === "absent").length

    // Calculate total students for this teacher's subject
    const totalStudents = new Set(attendanceData.map((a) => a.studentId)).size

    // Fix attendance rate calculation to avoid NaN
    const attendanceRate =
      presentToday + absentToday > 0 ? Math.round((presentToday / (presentToday + absentToday)) * 100) : 0

    setStats({
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
    })

    // Calculate attendance rate per student
    const studentAttendanceMap = {}

    // Initialize with all students
    studentData.forEach((student) => {
      studentAttendanceMap[student.studentId] = {
        studentId: student.studentId,
        name: student.name,
        department: student.depertment,
        semester: student.semister,
        section: student.section,
        totalClasses: 0,
        presentCount: 0,
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
        }
      }
    })

    // Calculate attendance rate for each student
    Object.values(studentAttendanceMap).forEach((student) => {
      if (student.totalClasses > 0) {
        student.attendanceRate = Math.round((student.presentCount / student.totalClasses) * 100)
      }
    })

    // Sort students by attendance rate (ascending) and take the lowest 5
    const sortedStudents = Object.values(studentAttendanceMap)
      .filter((student) => student.totalClasses > 0)
      .sort((a, b) => a.attendanceRate - b.attendanceRate)
      .slice(0, 5)

    setLowAttendanceStudents(sortedStudents)
  }

  if (loading) return <LoadingSpinner/>;
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


