import { useEffect, useState } from "react";
import StatCard from "../Components/Card/StatCard";
import { CalendarDaysIcon, UserGroupIcon, ClockIcon, ChartBarIcon } from "../Components/Icons/Icons";
import AttendanceReport from "../Components/AttendanceReport/AttendanceReport";

const Home = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalStudents: 145,
        presentToday: 132,
        absentToday: 13,
        attendanceRate: 91,
      })

      
    }, 500)
  }, [])


  return (
    <div>
      <div className="space-y-6 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<UserGroupIcon className="h-6 w-6 text-blue-500" />}
          color="blue"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={<CalendarDaysIcon className="h-6 w-6 text-green-500" />}
          color="green"
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={<ClockIcon className="h-6 w-6 text-red-500" />}
          color="red"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={<ChartBarIcon className="h-6 w-6 text-purple-500" />}
          color="purple"
        />
      </div>
      <div className="mt-6">
        <AttendanceReport/>
      </div>
    </div>
  );
};

export default Home;

