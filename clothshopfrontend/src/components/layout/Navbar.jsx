import { Box, Card, Divider, Image } from "@mantine/core";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Tooltipwrapper from "../common/Tooltipwrapper";
import { Search, User, ShoppingBag, Bell, SunMedium } from "lucide-react";
import NotificationDrawer from "./NotificationDrawer";
import logo from "../../assets/icons/LOGO.png";
const Navbar = () => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const handleSearch = () => {
    // Implement search functionality here
    toast.success("Coming Soon!.");
  };

  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Card
        p={0}
        style={{
          backgroundColor: "white",
          border: "none",
          borderRadius: 0,
          width: "100%",
        }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 35px",
          }}
        >
          <Box w={50}>
            <Image src={logo} radius="md" h={50} fit="contain" />
          </Box>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              fontSize: "16px",
              fontWeight: 400,
            }}
          >
            <Link to="/" style={{ textDecoration: "none", color: "black" }}>
              Home
            </Link>
            <Link
              to="/women"
              style={{ textDecoration: "none", color: "black" }}
            >
              Women
            </Link>
            <Link to="/men" style={{ textDecoration: "none", color: "black" }}>
              Men
            </Link>
            <Link to="/kids" style={{ textDecoration: "none", color: "black" }}>
              Kids
            </Link>
          </Box>
          <Box style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <Tooltipwrapper label="Search">
              <Search
                size={20}
                onClick={handleSearch}
                style={{ cursor: "pointer" }}
              />
            </Tooltipwrapper>
            <Tooltipwrapper label="light">
              <SunMedium size={20} style={{cursor:'pointer'}}/>
            </Tooltipwrapper>
            <Tooltipwrapper label="Notifications">
              <Bell
                size={20}
                onClick={() => setNotificationsOpen(true)}
                style={{ cursor: "pointer" }}
              />
            </Tooltipwrapper>
            <Tooltipwrapper label="Shopping Cart">
              <ShoppingBag
                size={20}
                onClick={() => navigate("/cart")}
                style={{ cursor: "pointer" }}
              />
            </Tooltipwrapper>
            <Tooltipwrapper label="Profile">
              <User
                size={20}
                onClick={() => {
                  navigate("/profile");
                }}
                style={{ cursor: "pointer" }}
              />
            </Tooltipwrapper>
          </Box>
        </nav>

        <Divider my={2} />
      </Card>
      <NotificationDrawer
        open={notificationsOpen}
        handleClose={() => setNotificationsOpen(false)}
      />
    </Box>
  );
};

export default Navbar;
