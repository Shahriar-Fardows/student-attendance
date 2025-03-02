import { useState, useEffect } from "react"
import { FaCalendarAlt, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa"
import StatCard from "../../Components/Card/StatCard"

export default function ClassReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attendance, setAttendance] = useState([])
  console.log(attendance.length ? [{ name: "Hidden", age: "N/A" }] : attendance);

  const [stats, setStats] = useState({
    totalClasses: 0,
    averageAttendance: 0,
    highestAttendance: { date: "", percentage: 0 },
    lowestAttendance: { date: "", percentage: 100 },
  })
  const [dailyRecords, setDailyRecords] = useState([])

  // Assuming we get the logged-in user's email from Firebase Auth
  const loggedInEmail = "shahriarfardows@gmail.com"

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // Process the attendance data
        processAttendanceData(teacherAttendance)

        setLoading(false)
      } catch (err) {
        setError("Failed to fetch data")
        setLoading(false)
        console.error(err)
      }
    }

    fetchData()
  }, [])

  const processAttendanceData = (attendanceData) => {
    // Group attendance by date
    const groupedByDate = attendanceData.reduce((acc, record) => {
      const date = record.date
      if (!acc[date]) {
        acc[date] = {
          present: 0,
          absent: 0,
          total: 0,
          percentage: 0,
        }
      }

      if (record.status === "present") {
        acc[date].present++
      } else if (record.status === "absent") {
        acc[date].absent++
      }

      acc[date].total = acc[date].present + acc[date].absent
      acc[date].percentage = Math.round((acc[date].present / acc[date].total) * 100)

      return acc
    }, {})

    // Convert grouped data to array and sort by date
    const dailyRecords = Object.entries(groupedByDate)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    // Calculate statistics
    const totalClasses = dailyRecords.length
    const averageAttendance = Math.round(
      dailyRecords.reduce((sum, record) => sum + record.percentage, 0) / totalClasses,
    )

    // Find highest and lowest attendance
    const highestAttendance = dailyRecords.reduce(
      (max, record) =>
        record.percentage > max.percentage ? { date: record.date, percentage: record.percentage } : max,
      { date: "", percentage: 0 },
    )

    const lowestAttendance = dailyRecords.reduce(
      (min, record) =>
        record.percentage < min.percentage ? { date: record.date, percentage: record.percentage } : min,
      { date: "", percentage: 100 },
    )

    setStats({
      totalClasses,
      averageAttendance,
      highestAttendance,
      lowestAttendance,
    })

    setDailyRecords(dailyRecords)
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Class Report</h1>
          <p className="text-gray-600 mt-2">Detailed attendance statistics and history</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            icon={<FaCalendarAlt className="text-blue-500" size={24} />}
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Average Attendance"
            value={`${stats.averageAttendance}%`}
            icon={<FaChartLine className="text-purple-500" size={24} />}
            bgColor="bg-purple-100"
          />
          <StatCard
            title="Highest Attendance"
            value={`${stats.highestAttendance.percentage}%`}
            subtitle={stats.highestAttendance.date}
            icon={<FaArrowUp className="text-green-500" size={24} />}
            bgColor="bg-green-100"
          />
          <StatCard
            title="Lowest Attendance"
            value={`${stats.lowestAttendance.percentage}%`}
            subtitle={stats.lowestAttendance.date}
            icon={<FaArrowDown className="text-red-500" size={24} />}
            bgColor="bg-red-100"
          />
        </div>

        {/* Attendance History Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm text-gray-900">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{record.present}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{record.absent}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                          <div
                            className={`h-2.5 rounded-full ${
                              record.percentage < 50
                                ? "bg-red-500"
                                : record.percentage < 75
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${record.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{record.percentage}%</span>
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

