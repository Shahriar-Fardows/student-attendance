import { Outlet } from "react-router-dom";
import Sidebar from "./Shared/Sidebar";

const Root = () => {
  return (
    <div className=" flex flex-col">
      {/* The Sidebar component handles its own positioning */}
      <Sidebar />
      
      {/* Main content area that adjusts based on sidebar */}
      <div className="flex-1 lg:ml-64 mt-16 lg:mt-24">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Root;