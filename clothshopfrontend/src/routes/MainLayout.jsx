import { Outlet } from "react-router";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const MainLayout = ({
  colorScheme,
  toggleColorScheme,
}) => {
  return (
    <>
      <Navbar
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      />

      <Outlet />

      <Footer />
    </>
  );
};

export default MainLayout;