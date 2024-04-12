import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import React, { useState } from "react";
import WelcomePage from "./pages/WelcomePage.jsx";

import ApplicationPage from "./pages/ApplicationPage.jsx";

import Analyser from "./pages/Analyzer.jsx";
import Profile from "./pages/Profille.jsx";

import Login from "./pages/Login.jsx";
import LoginPassword from "./pages/Login2.jsx";
import ApplicationPageView from "./pages/ApplicationPageView.jsx";
import CreateAppllication from "./pages/createApplication.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SignUp from "./pages/SignUp.jsx"

import TestPage from "./Components/TestPage/TestPage.jsx"
import RoleAccess from "../RoleAccess.jsx";
// import PrivateRoute from "../PrivateRoute.jsx";
import Professional from "./pages/Profession.jsx";

import { AuthProvider } from "../src/auth/AuthContext.jsx";

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" Component={Login} ></Route>
          <Route path="/login2" Component={LoginPassword}></Route>
          <Route path="/signup" Component={SignUp}></Route>
          <Route path="/testpage" Component={TestPage}></Route>

          <Route element={<RoleAccess roles={["Student"]} />}>
            <Route path="/application/:resumeId" Component={ApplicationPage}></Route>
            <Route path="/edit-profession" Component={Professional}></Route>
            <Route path="/applicationview/:jobId/:documentId" Component={ApplicationPageView} ></Route>
            <Route path="/analyze/:documentId" Component={Analyser}></Route>
            <Route path="/welcome" Component={WelcomePage}></Route>
          </Route>

          <Route element={<RoleAccess roles={["Recruiter"]} />}>
            <Route path="/dashboard" Component={Dashboard}></Route>
            <Route path="/createapplication" Component={CreateAppllication}></Route>
          </Route>

          <Route element={<RoleAccess roles={["Student", "Recruiter"]} />}>
            <Route path="/edit-profile" Component={Profile}></Route>
          </Route>
        </Routes>

      </BrowserRouter>
    </AuthProvider >
  )
}



export default App
