import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/SignIn/Login";
import Register from "./pages/SignUp/Register";
import PrivateRoute from "./routes/PrivateRoute";
import Home from "./pages/Home/Home";
import { MantineProvider } from "@mantine/core";
import MainLayout from "./routes/MainLayout";
import PublicRoute from "./routes/PublicRoute";

function App() {
  const [colorScheme, setColorScheme] = React.useState(
    localStorage.getItem("theme"),
  );

  const toggleColorScheme = () => {
    setColorScheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };
  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
           {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
           {/* Private Routes */}
          <Route
            element={
              <MainLayout
                colorScheme={colorScheme}
                toggleColorScheme={toggleColorScheme}
              />
            }
          >
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<Home />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
