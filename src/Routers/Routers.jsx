import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorPage from "../Error/ErrorPage";
import Home from "../Home/Home";
import LoadingSpinner from "../Shared/LoadingSpinner";

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
                  <Suspense fallback={<LoadingSpinner />}>
                    <Home />
                  </Suspense>
                ),
            },
        ],
    },
]);

export default Routers;
