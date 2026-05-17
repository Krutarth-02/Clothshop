import {
  Box,
  Card,
  Divider,
  Text,
  useMantineTheme,
} from "@mantine/core";

import React from "react";

import { Link, useNavigate } from "react-router-dom";

import Tooltipwrapper from "../common/Tooltipwrapper";

import {
  Search,
  User,
  ShoppingBag,
  Bell,
  SunMedium,
  Moon,
  Menu,
  X,
} from "lucide-react";

import NotificationDrawer from "./NotificationDrawer";

const Navbar = ({
  colorScheme,
  toggleColorScheme,
}) => {
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] =
    React.useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    React.useState(false);

  const theme = useMantineTheme();

  const linkStyle = {
    textDecoration: "none",
    color:
      colorScheme === "dark"
        ? "white"
        : "black",
    fontWeight: 500,
  };

  return (
    <Box
      style={{
        width: "100%",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Card
        p={0}
        style={{
          width: "100%",
          backgroundColor:
            colorScheme === "dark"
              ? "#1A1B1E"
              : "white",
        }}
      >
        {/* NAVBAR */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            padding: "12px 20px",
          }}
        >
          {/* LOGO */}
          <Text size="xl" fw={900}>
            ClothShop
          </Text>

          {/* DESKTOP MENU */}
          <Box
            visibleFrom="md"
            style={{
              display: "flex",
              gap: "40px",
            }}
          >
            <Link to="/" style={linkStyle}>
              Home
            </Link>

            <Link
              to="/women"
              style={linkStyle}
            >
              Women
            </Link>

            <Link
              to="/men"
              style={linkStyle}
            >
              Men
            </Link>

            <Link
              to="/kids"
              style={linkStyle}
            >
              Kids
            </Link>
          </Box>

          {/* ICONS */}
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <Search
              size={20}
              style={{ cursor: "pointer" }}
            />

            {colorScheme === "light" ? (
              <Moon
                size={20}
                style={{
                  cursor: "pointer",
                }}
                onClick={
                  toggleColorScheme
                }
              />
            ) : (
              <SunMedium
                size={20}
                style={{
                  cursor: "pointer",
                }}
                onClick={
                  toggleColorScheme
                }
              />
            )}

            <Bell
              size={20}
              style={{ cursor: "pointer" }}
              onClick={() =>
                setNotificationsOpen(true)
              }
            />

            <ShoppingBag
              size={20}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate("/cart")
              }
            />

            <User
              size={20}
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate("/profile")
              }
            />

            {/* MOBILE MENU BUTTON */}
            <Box hiddenFrom="md">
              {mobileMenuOpen ? (
                <X
                  size={22}
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setMobileMenuOpen(
                      false
                    )
                  }
                />
              ) : (
                <Menu
                  size={22}
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setMobileMenuOpen(
                      true
                    )
                  }
                />
              )}
            </Box>
          </Box>
        </nav>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <Box
            hiddenFrom="md"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              padding: "20px",
            }}
          >
            <Link to="/" style={linkStyle}>
              Home
            </Link>

            <Link
              to="/women"
              style={linkStyle}
            >
              Women
            </Link>

            <Link
              to="/men"
              style={linkStyle}
            >
              Men
            </Link>

            <Link
              to="/kids"
              style={linkStyle}
            >
              Kids
            </Link>
          </Box>
        )}

        <Divider my={2} />
      </Card>

      <NotificationDrawer
        open={notificationsOpen}
        handleClose={() =>
          setNotificationsOpen(false)
        }
      />
    </Box>
  );
};

export default Navbar;