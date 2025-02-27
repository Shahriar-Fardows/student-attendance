import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorPage from "../Error/ErrorPage";
import Home from "../Home/Home";
import LoadingSpinner from "../Shared/LoadingSpinner";
import Register from "../Page/Register/Register";
import Profile from "../Page/Profile/Profile";
import StudentList from "../Page/Student/StudentList";
import PrivetRoute from "./PrivetRoute";

// Define the wait function
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Dynamically import the Root component
const Root = lazy(() => wait(3000).then(() => import("../Root")));

const Routers = createBrowserRouter([
    {
        path: "/",
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Root />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: (
                  <PrivetRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                    <Home />
                  </Suspense>
                  </PrivetRoute>
                ),
            },
            {
                path: "/profile",
                element: (
                  <PrivetRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Profile />
                  </Suspense>
                  </PrivetRoute>
                ),
            },
            {
                path: "/student_list",
                element: (
                  <PrivetRoute>
                  <Suspense fallback={<LoadingSpinner />}>
                    <StudentList />
                  </Suspense>
                  </PrivetRoute>
                ),
            },
            
        ],
    },
    {
      path: "/login",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <Register />
        </Suspense>
      ),
  },
]);

export default Routers;
