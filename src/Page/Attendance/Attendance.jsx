import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { Contexts } from "../../Auth/Context/Context"
import useAuthContext from "../../Auth/Context/useAuthContext"
import LoadingSpinner from "../../Shared/LoadingSpinner"

const AttendancePage = () => {
    // State for storing API data
    const [teacher, setTeacher] = useState(null)
    const [students, setStudents] = useState([])
    const [filteredStudents, setFilteredStudents] = useState([])
    const [attendanceData, setAttendanceData] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)
    const { user } = useAuthContext(Contexts);


    // State for filters
    const [departments, setDepartments] = useState([])
    const [semesters, setSemesters] = useState([])
    const [sections, setSections] = useState([])
    const [selectedDepartment, setSelectedDepartment] = useState("")
    const [selectedSemester, setSelectedSemester] = useState("")
    const [selectedSection, setSelectedSection] = useState("")

    const loggedInEmail = user?.email;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
    
                if (loggedInEmail) {
                    // Fetch teacher data
                    const teacherResponse = await fetch("https://attendans-server.vercel.app/api/getTeacher");
                    const teacherData = await teacherResponse.json();
    
                    // Filter teacher by email
                    const matchedTeacher = teacherData.find(teacher => teacher.email === loggedInEmail);
    
                    if (matchedTeacher) {
                        setTeacher(matchedTeacher);
                    } else {
                        console.log("No teacher found with this email.");
                        setTeacher(null);
                    }
                }
    
                let studentData = [];
    
                try {
                    // প্রথম API থেকে ডেটা ফেচ করার চেষ্টা
                    const studentResponse = await fetch("https://sheetdb.io/api/v1/8nv4w9rg5hjjp");
                    if (!studentResponse.ok) {
                        throw new Error('প্রথম API কল লিমিট শেষ');
                    }
                    studentData = await studentResponse.json();
                    setStudents(studentData);
                } catch (error) {
                    console.warn('প্রথম API ব্যর্থ হয়েছে, দ্বিতীয় API কল হচ্ছে...', error.message);
    
                    // দ্বিতীয় API থেকে ডেটা ফেচ করার চেষ্টা
                    try {
                        const fallbackResponse = await fetch("https://sheetdb.io/api/v1/ja0l8nz04bsok");
                        if (!fallbackResponse.ok) {
                            throw new Error('দ্বিতীয় API-ও ব্যর্থ');
                        }
                        studentData = await fallbackResponse.json();
                        setStudents(studentData);
                    } catch (fallbackError) {
                        console.error('দ্বিতীয় API-ও কাজ করছে না:', fallbackError.message);
                    }
                }
    
                // Extract unique departments, semesters, and sections
                const uniqueDepartments = [
                    ...new Set(studentData.map((student) => student.depertment?.trim() || student["depertment "]?.trim())),
                ].filter(Boolean);
                
                const uniqueSemesters = [
                    ...new Set(studentData.map((student) => student.semister?.trim() || student["semister"]?.trim())),
                ].filter(Boolean);
                
                const uniqueSections = [
                    ...new Set(studentData.map((student) => student.section?.trim())),
                ].filter(Boolean);
    
                setDepartments(uniqueDepartments);
                setSemesters(uniqueSemesters);
                setSections(uniqueSections);
    
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
    
        fetchData();
    }, []);
    

    // Filter students based on selected department, semester, and section
    useEffect(() => {
        if (selectedDepartment && selectedSemester && selectedSection) {
            const filtered = students.filter((student) => {
                const studentDept = student.depertment?.trim() || student["depertment "]?.trim()
                const studentSemester = student.semister?.trim() || student["semister"]?.trim()
                const studentSection = student.section?.trim()

                return (
                    studentDept === selectedDepartment &&
                    studentSemester === selectedSemester &&
                    studentSection === selectedSection
                )
            })

            // Initialize attendance data for filtered students
            const initialAttendance = filtered.map((student) => {
                const studentDept = student.depertment?.trim() || student["depertment "]?.trim()
                return {
                    date: new Date().toISOString().split("T")[0],
                    studentId: student.studentId?.trim() || student["studentId "]?.trim(),
                    name: student.name,
                    department: studentDept,
                    semester: student.semister?.trim() || student["semister"]?.trim(),
                    section: student.section?.trim(),
                    status: "present", // Set initial status to "present"
                    teacherEmail: teacher?.email || "",
                    subject: teacher?.subject || "",
                }
            })

            setFilteredStudents(filtered)
            setAttendanceData(initialAttendance)
        } else {
            setFilteredStudents([])
            setAttendanceData([])
        }
    }, [selectedDepartment, selectedSemester, selectedSection, students, teacher])

    // Handle attendance status change
    const handleAttendanceChange = (studentId) => {
        setAttendanceData((prevData) =>
            prevData.map((item) =>
                item.studentId === studentId ? { ...item, status: item.status === "present" ? "absent" : "present" } : item,
            ),
        )
    }

    // Submit attendance data
    const handleSubmit = async () => {
        // Validate that all students have a status (this check is now redundant but kept for safety)
        const incomplete = attendanceData.some((item) => !item.status)
        if (incomplete) {
            alert("There was an error with the attendance data. Please try again.")
            return
        }

        try {
            setSubmitting(true)
            setSubmitError(null)

            // Format data for SheetDB
            const formattedData = { data: attendanceData }

            // Submit to SheetDB
            const response = await fetch("https://attendans-server.vercel.app/api/Attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            })

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Attendance submitted successfully!",
                    showConfirmButton: false,
                    timer: 3000,
                })
                // Reset form after successful submission
                setTimeout(() => {
                    setSelectedDepartment("")
                    setSelectedSemester("")
                    setSelectedSection("")
                    setFilteredStudents([])
                    setAttendanceData([])
                }, 3000)
            } else {
                throw new Error("Failed to submit attendance data")
            }
        } catch (error) {
            console.error("Error submitting attendance:", error)
            setSubmitError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen lg:py-8">
            <div>
                {/* Header */}
                <div className="mb-2 px-4">
                    <div className="space-y-6 py-5">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
                        </div>
                    </div>
                    {teacher && (
                        <p className="text-lg text-gray-600">
                            Teacher: {teacher.name} | Subject: {teacher.subject}
                        </p>
                    )}
                </div>

                {loading ? (
                    <LoadingSpinner/>
                ) : (
                    <>
                        {/* Filters */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Class Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-white border"
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                                        Semester
                                    </label>
                                    <select
                                        id="semester"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-white border"
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        disabled={!selectedDepartment}
                                    >
                                        <option value="">Select Semester</option>
                                        {semesters.map((sem) => (
                                            <option key={sem} value={sem}>
                                                {sem}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                                        Section
                                    </label>
                                    <select
                                        id="section"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-white border"
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        disabled={!selectedSemester}
                                    >
                                        <option value="">Select Section</option>
                                        {sections.map((sec) => (
                                            <option key={sec} value={sec}>
                                                {sec}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        {filteredStudents.length > 0 && (
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        Student Attendance - {new Date().toLocaleDateString()}
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        {selectedDepartment} Department | Semester {selectedSemester} | Section {selectedSection}
                                    </p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Student ID
                                                </th>
                                                <th
                                                    scope="col"
                                                    className=" px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Name
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Department
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Semester
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Section
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    Attendance
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredStudents.map((student) => {
                                                const studentId = student.studentId?.trim() || student["studentId "]?.trim()
                                                const studentAttendance = attendanceData.find((item) => item.studentId === studentId)
                                                const attendanceStatus = studentAttendance?.status || ""

                                                return (
                                                    <tr key={studentId}>
                                                        <td className="hidden lg:table-cell  px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {studentId}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.name}</td>
                                                        <td className="hidden lg:table-cell  px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.depertment?.trim() || student["depertment "]?.trim()}
                                                        </td>
                                                        <td className="hidden lg:table-cell  px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.semister?.trim() || student["semister"]?.trim()}
                                                        </td>
                                                        <td className="hidden lg:table-cell  px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                type="button"
                                                                className={`px-3 py-1 rounded-md text-sm font-medium ${attendanceStatus === "present"
                                                                        ? "bg-green-100 text-green-800 border border-green-500 hover:bg-green-200"
                                                                        : "bg-red-100 text-red-800 border border-red-500 hover:bg-red-200"
                                                                    }`}
                                                                onClick={() => handleAttendanceChange(studentId)}
                                                            >
                                                                {attendanceStatus === "present" ? "Present" : "Absent"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Submit Button */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${submitting
                                                    ? "bg-blue-400 cursor-not-allowed"
                                                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                }`}
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Submitting...
                                                </>
                                            ) : (
                                                "Submit Attendance"
                                            )}
                                        </button>
                                    </div>

                                    {/* Error Message */}
                                    {submitError && (
                                        <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        className="h-5 w-5 text-red-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-red-800">Error: {submitError}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* No Students Message */}
                        {selectedDepartment && selectedSemester && selectedSection && filteredStudents.length === 0 && (
                            <div className="bg-white shadow rounded-lg p-6 text-center">
                                <p className="text-gray-500">No students found for the selected department, semester, and section.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AttendancePage

