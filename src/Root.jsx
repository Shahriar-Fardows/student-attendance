import { Outlet } from "react-router-dom";
import Navbar from "./Shared/Navbar";

const Root = () => {
    return (
        <div className="relative">
            <div className="sticky top-0 z-50">
                <Navbar/>
            </div>
            <Outlet/>
        </div>
    );
};

export default Root;