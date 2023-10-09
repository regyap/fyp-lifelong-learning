import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import React from "react";
import WelcomePage from "./pages2/WelcomePage.jsx"
import NavPage from "./Components/TopBar/TopBar.jsx"
import ResumeChecker from "./pages2/WelcomePage.jsx"

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" Component={WelcomePage}></Route>
        <Route path="/resumechecker" Component={ResumeChecker}></Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
