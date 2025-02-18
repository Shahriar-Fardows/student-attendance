import { Link } from "react-router-dom";
import images from "../assets/images";
import { useState } from "react";


const Navbar = () => {
  const [isToggleOpen, setIsToggleOpen] = useState(false)

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/student_list", label: "Student List" },
    
  ];

  return (
    <>

      {/*<!-- Header --> */}
      <header className={`relative z-20 w-full border-b border-slate-200 bg-white/90 shadow-slate-700/5 `}>
        {/* <div className="relative mx-auto max-w-full px-6 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[96rem]"> */}
          <nav className="flex h-[5.5rem] items-stretch justify-between font-medium text-slate-700">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 py-3 text-lg whitespace-nowrap focus:outline-none lg:flex-1">
              <img src={images?.image?.logo} alt="logo" className="w-20" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              className={`relative order-10 block h-10 w-10 self-center lg:hidden ${isToggleOpen ? "open-class" : ""}`}
              onClick={() => setIsToggleOpen(!isToggleOpen)}
              aria-expanded={isToggleOpen}
              aria-label="Toggle navigation"
            >
              <div className="absolute w-6 transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <span className="absolute block h-0.5 w-9/12 -translate-y-2 transform rounded-full bg-slate-900 transition-all duration-300"></span>
                <span className="absolute block h-0.5 w-6 transform rounded-full bg-slate-900 transition duration-300"></span>
                <span className="absolute block h-0.5 w-1/2 origin-top-left translate-y-2 transform rounded-full bg-slate-900 transition-all duration-300"></span>
              </div>
            </button>

            {/* Navigation Links */}
            <ul className={`absolute left-0 top-0 z-[-1] h-[28.5rem] w-full justify-center overflow-hidden overflow-y-auto overscroll-contain bg-white/90 px-8 pb-12 pt-24 font-medium transition-[opacity,visibility] duration-300 lg:visible lg:relative lg:top-0 lg:z-0 lg:flex lg:h-full lg:w-auto lg:items-stretch lg:overflow-visible lg:bg-white/0 lg:px-0 lg:py-0 lg:pt-0 lg:opacity-100 ${isToggleOpen ? "visible opacity-100 backdrop-blur-sm" : "invisible opacity-0"}`}>
              {navLinks.map(({ path, label }) => (
                <li key={path} role="none" className="flex items-stretch">
                  <Link
                    to={path}
                    smooth={true}
                    duration={500}
                    onClick={() => setIsToggleOpen(false)}  // Close the menu on link click
                    className={`flex items-center gap-2 py-4 transition-colors duration-300 lg:px-8 ${location.pathname === path ? "text-[#9e1c21] font-semibold" : "hover:text-emerald-600"}`}
                  >
                    <span>{label}</span>
                  </Link>
                </li>

              ))}

            </ul>

            {/* Join With Us Button */}
            <div className="flex items-center px-6 ml-auto lg:ml-0 lg:p-0">
              <Link to='joinFrom-section' smooth={true} duration={500} onClick={() => setIsToggleOpen(false)}>
                <button className="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded shadow-md whitespace-nowrap bg-[#9e1c21] hover:bg-emerald-600 focus:outline-none">
                  <span>Attendance</span>
                </button>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      {/*<!-- End Navbar with Topbar--> */}
    </>
  );
};

export default Navbar;