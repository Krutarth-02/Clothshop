import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import RikAssistant from "../components/assistant/RikAssistant";

const MainLayout = ({ colorScheme, toggleColorScheme }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <>
      <Navbar colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />

      <Outlet />

      <Footer />
      <RikAssistant colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />
    </>
  );
};

export default MainLayout;
