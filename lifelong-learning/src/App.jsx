import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import React, { useState } from "react";
import WelcomePage from "./pages/WelcomePage.jsx"
import NavPage from "./Components/TopBar/TopBar.jsx"
import ResumeChecker from "./pages/WelcomePage.jsx"
import EditProfilePage from "./pages/EditProfilePage.jsx"
import ApplicationPage from "./pages/ApplicationPage.jsx"
import RegisterPage from "./pages/Register.jsx"
import EditProfileInfo from "./pages/EnterProfileInfo.jsx"
import Analyser from "./pages/Analyzer.jsx"

import Login from "./pages/Login.jsx"
import LoginPassword from "./pages/Login2.jsx"
import ApplicationPageView from "./pages/ApplicationPageView.jsx";
import JobCreationPage from "./pages/JobCreationPage.jsx";



import SignUp from "./pages/SignUp.jsx"

import TestPage from "./Components/TestPage/TestPage.jsx"
import RoleAccess from "../RoleAccess.jsx";
// import PrivateRoute from "../PrivateRoute.jsx";

import { AuthProvider } from "../src/auth/AuthContext.jsx"

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" Component={Login} ></Route>
          <Route path="/login2" Component={LoginPassword}></Route>
          <Route path="/signup" Component={SignUp}></Route>
          <Route path="/application" Component={ApplicationPage}></Route>
          <Route path="/applicationview/:jobId" Component={ApplicationPageView}></Route>
          <Route path="/analyser" Component={Analyser}></Route>

          <Route path="/register" Component={RegisterPage}></Route>
          <Route path="/enterProfileInfo" Component={EditProfileInfo}></Route>
          <Route path="/edit-profile" Component={EditProfilePage}></Route>
          <Route path="/welcome" Component={WelcomePage}></Route>
          <Route path="/jobcreation" Component={JobCreationPage}></Route>


          <Route element={<RoleAccess roles={["Student"]} />}>

            <Route path="/resumechecker" Component={ResumeChecker}></Route>
          </Route>

          <Route element={<RoleAccess roles={["Student", "Recruiter"]} />}>

            <Route path="/editprofile" Component={EditProfilePage}></Route>
          </Route>


          <Route path="/testpage" Component={TestPage}></Route>



        </Routes>

      </BrowserRouter>
    </AuthProvider>
  )
}


// function Home() {
//   useEffect(() => {
//     fetch("/api").then(resp => resp.json()).then(resp => console.log(resp))
//   }, [])
//   return <h2>Home</h2>;
// }

export default App
