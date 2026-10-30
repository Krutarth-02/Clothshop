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
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp/VerifyOtp";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import { theme } from "../theme";
import Shop from "./pages/Shop/Shop";
import About from "./pages/About/About";
import ProductDetails from "./pages/Product/ProductDetails";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import Wishlist from "./pages/Wishlist/Wishlist";
import GuidancePage from "./pages/Guidance/GuidancePage";
import { guidancePages } from "./data/guidance";

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
    <MantineProvider theme={theme} forceColorScheme={colorScheme || "light"}>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          {/* Storefront Routes */}
          <Route
            element={
              <MainLayout
                colorScheme={colorScheme}
                toggleColorScheme={toggleColorScheme}
              />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop key="all" collection="all" />} />
            <Route
              path="/new-arrivals"
              element={<Shop key="new" collection="new" />}
            />
            <Route
              path="/women"
              element={<Shop key="women" collection="women" />}
            />
            <Route path="/men" element={<Shop key="men" collection="men" />} />
            <Route
              path="/accessories"
              element={<Shop key="accessories" collection="accessories" />}
            />
            <Route path="/about" element={<About />} />
            {guidancePages.map((page) => (
              <Route key={page.path} path={page.path} element={<GuidancePage key={page.path} page={page} />} />
            ))}
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Cart checkout />} />
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
