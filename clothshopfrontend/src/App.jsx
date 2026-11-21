import { readStorage, writeStorage } from "./redux/api/baseQueryWithAuth";
import { createElement, lazy, Suspense, useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Link, Route, Routes } from "react-router";
import { Button, Container, MantineProvider, Stack, Title } from "@mantine/core";
import MainLayout from "./routes/MainLayout";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import LoadingState from "./components/common/Loader";
import { theme } from "../theme";
import { guidancePages } from "./data/guidance";

const Login = lazy(() => import("./pages/SignIn/Login"));
const Register = lazy(() => import("./pages/SignUp/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword/ForgotPassword"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp/VerifyOtp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword/ResetPassword"));
const Home = lazy(() => import("./pages/Home/Home"));
const Shop = lazy(() => import("./pages/Shop/Shop"));
const About = lazy(() => import("./pages/About/About"));
const ProductDetails = lazy(() => import("./pages/Product/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart/Cart"));
const Checkout = lazy(() => import("./pages/Cart/Checkout"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist/Wishlist"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const GuidancePage = lazy(() => import("./pages/Guidance/GuidancePage"));

const collections = [
  { path: "/shop", collection: "all" },
  { path: "/new-arrivals", collection: "new" },
  { path: "/women", collection: "women" },
  { path: "/men", collection: "men" },
  { path: "/accessories", collection: "accessories" },
];

function RouteScreen({ component, ...props }) {
  return <Suspense fallback={<LoadingState label="Loading page" />}>{createElement(component, props)}</Suspense>;
}

function NotFound() {
  return <Container py={80}><Stack align="center">
    <Title order={1}>Page not found</Title>
    <Button component={Link} to="/" color="dark">Back to store</Button>
  </Stack></Container>;
}

export default function App() {
  const [colorScheme, setColorScheme] = useState(() => {
    try { return readStorage("theme") === "dark" ? "dark" : "light"; }
    catch { return "light"; }
  });
  const toggleColorScheme = () => setColorScheme((previous) => {
    const next = previous === "light" ? "dark" : "light";
    try { writeStorage("theme", next); } catch { /* Keep the in-memory preference. */ }
    return next;
  });

  return <MantineProvider theme={theme} forceColorScheme={colorScheme}>
    <Toaster position="top-right" />
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<RouteScreen component={Login} />} />
          <Route path="/register" element={<RouteScreen component={Register} />} />
          <Route path="/forgot-password" element={<RouteScreen component={ForgotPassword} />} />
          <Route path="/verify-otp" element={<RouteScreen component={VerifyOtp} />} />
          <Route path="/reset-password" element={<RouteScreen component={ResetPassword} />} />
        </Route>
        <Route element={<MainLayout colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />}>
          <Route path="/" element={<RouteScreen component={Home} />} />
          {collections.map(({ path, collection }) => <Route key={path} path={path}
            element={<RouteScreen key={collection} component={Shop} collection={collection} />} />)}
          <Route path="/about" element={<RouteScreen component={About} />} />
          <Route path="/contact" element={<RouteScreen component={Contact} />} />
          {guidancePages.map((page) => <Route key={page.path} path={page.path}
            element={<RouteScreen key={page.path} component={GuidancePage} page={page} />} />)}
          <Route path="/product/:id" element={<RouteScreen component={ProductDetails} />} />
          <Route path="/cart" element={<RouteScreen component={Cart} />} />
          <Route path="/wishlist" element={<RouteScreen component={Wishlist} />} />
          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<RouteScreen component={Checkout} />} />
            <Route path="/home" element={<RouteScreen component={Home} />} />
            <Route path="/profile" element={<RouteScreen component={Profile} />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </MantineProvider>;
}
