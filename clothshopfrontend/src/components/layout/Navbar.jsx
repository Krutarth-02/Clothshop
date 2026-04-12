import { Box, Card, Divider } from "@mantine/core";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Tooltipwrapper from "../common/Tooltipwrapper";
import { Search, User, ShoppingBag, Bell } from "lucide-react";
import NotificationDrawer from "./NotificationDrawer";
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
            justifyContent: "space-around",
            gap: "5px",
            padding: "7px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            HiFashionHub
          </h1>
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
            <Link to="/shop" style={{ textDecoration: "none", color: "black" }}>
              Shop
            </Link>
            <Link
              to="/about"
              style={{ textDecoration: "none", color: "black" }}
            >
              About
            </Link>
            <Link
              to="/contact"
              style={{ textDecoration: "none", color: "black" }}
            >
              Contact
            </Link>
            <Link
              to="/review"
              style={{ textDecoration: "none", color: "black" }}
            >
              Review
            </Link>
            <Link to="/blog" style={{ textDecoration: "none", color: "black" }}>
              Blog
            </Link>
          </Box>
          <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <Tooltipwrapper label="Search">
              <Search
                size={20}
                onClick={handleSearch}
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
            <Tooltipwrapper label="Shopping Cart">
              <ShoppingBag
                size={20}
                onClick={() => navigate("/cart")}
                style={{ cursor: "pointer" }}
              />
            </Tooltipwrapper>
            <Tooltipwrapper label="Notifications">
              <Bell
                size={20}
                onClick={() => setNotificationsOpen(true)}
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
