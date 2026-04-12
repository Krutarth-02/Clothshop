import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route,  Routes } from "react-router";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import Announcement from "./components/layout/Announcement";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Announcement/>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
