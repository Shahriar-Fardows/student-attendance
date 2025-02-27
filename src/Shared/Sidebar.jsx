import { Link } from "react-router-dom";
import images from "../assets/images";
import { useState } from "react";
import { Contexts } from "../Auth/Context/Context";
import useAuthContext from "../Auth/Context/useAuthContext";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {LogOut} = useAuthContext(Contexts);

  const navLinks = [
    { path: "/", label: "Dashboard", icon: "https://img.icons8.com/?size=100&id=PO8vxejgExcL&format=png&color=000000" },
    { path: "/profile", label: "Profile", icon: "https://img.icons8.com/?size=100&id=NqZQc8ORlO2Z&format=png&color=000000" },
    { path: "/student_list", label: "Student List", icon: "https://img.icons8.com/?size=100&id=fxJr4uPpcSrl&format=png&color=000000" },
    { path: "/attendance", label: "Attendance", icon: "https://img.icons8.com/?size=100&id=9zf2yAg95Sza&format=png&color=000000" },
  ];



  return (
    <div className="flex flex-col dark:bg-gray-900">
      {/* Mobile Header - Always visible on mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 h-16 border-b border-slate-200 dark:border-gray-700 flex items-center px-4 shadow-sm">
        {/* Hamburger Button */}
        <button
          className="p-2 rounded-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle navigation"
        >
          <div className="w-6 flex flex-col gap-1">
            <span
              className={`block h-0.5 w-6 bg-slate-900 dark:bg-white transform transition-all duration-300 ${isSidebarOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-slate-900 dark:bg-white transition-all duration-300 ${isSidebarOpen ? "opacity-0" : ""
                }`}
            ></span>
            <span
              className={`block h-0.5 w-6 bg-slate-900 dark:bg-white transform transition-all duration-300 ${isSidebarOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
            ></span>
          </div>
        </button>

        {/* Logo mobile screen */}
        <Link to="/" className="">
          <img src={images?.image?.logo || "/placeholder.svg"} alt="logo" className="h-12" />
        </Link>

      </header>
      {/* Sidebar */}
      <div
        className={`bg-white dark:bg-gray-800 fixed top-0 lg:top-0 h-screen w-64 transform transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-gray-700 z-40 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo Section */}
        <div className="h-24 border-b border-slate-200 dark:border-gray-700 flex items-center justify-center px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={images?.image?.logo || "/placeholder.svg"} alt="logo" className="h-20" />
          </Link>
        </div>


        {/* Navigation Links */}
        <nav className="py-6 flex-1">
          <ul className="space-y-2">
            {navLinks.map(({ path, label, icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center px-6 py-3 text-sm transition-colors duration-300 ${location.pathname === path
                      ? "text-[#9e1c21] dark:text-red-400 font-semibold bg-red-50 dark:bg-red-900/20"
                      : "text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="mr-3">
                    <img src={icon || "/placeholder.svg"} alt="" className="h-5 dark:invert" />
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Buttons Section */}
        <div className="border-t border-slate-200 dark:border-gray-700 p-4 space-y-3">
          {/* App Download Button */}
          <button className="inline-flex w-full h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-6 text-sm font-medium tracking-wide text-emerald-500 dark:text-emerald-400 transition duration-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-300 focus:bg-emerald-200 focus:text-emerald-700 focus-visible:outline-none">
            <span className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </span>
            <span>App Download</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {LogOut()}}
            className="inline-flex w-full h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-red-50 dark:bg-red-900/20 px-6 text-sm font-medium tracking-wide text-red-500 dark:text-red-400 transition duration-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 focus:bg-red-200 focus:text-red-700 focus-visible:outline-none"
          >
            <span className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </div>
      </div>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#c5c5c563] dark:bg-black/50 bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;