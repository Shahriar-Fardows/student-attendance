import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {RouterProvider} from "react-router-dom";
import "./index.css";
import Routers from './Routers/Routers.jsx';
import Context from './Auth/Context/Context.jsx';
import { Helmet } from 'react-helmet';



createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Helmet>
     <Context>
    <RouterProvider router={Routers} />
      
    </Context>
    </Helmet>
    
  </StrictMode>,
)
