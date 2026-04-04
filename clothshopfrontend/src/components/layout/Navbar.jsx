import React from "react";
import { Link } from "react-router";
import { Box, Card, Flex, Heading } from "@chakra-ui/react";
import { Search, ShoppingBag, User } from "lucide-react";
import Tooltipwrapper from "../common/Tooltipwrapper";
const Navbar = () => {
  return (
    <Card.Root w="100%" h="50px">
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-around"}
      >
        <Heading size={"3xl"}>Punita</Heading>
        <Flex gap={2} fontWeight={500}>
          <Link style={{ fontSize: 14 }} to={"/"}>
            Home
          </Link>
          <Link style={{ fontSize: 14 }} to={"/shop"}>
            Shop
          </Link>
          <Link style={{ fontSize: 14 }} to={"/categories"}>
            Categories
          </Link>
          <Link style={{ fontSize: 14 }} to={"/about"}>
            About
          </Link>
          <Link style={{ fontSize: 14 }} to={"/review"}>
            Review
          </Link>
          <Link style={{ fontSize: 14 }} to={"/faq"}>
            FAQ
          </Link>
          <Link style={{ fontSize: 14 }} to={"/journal"}>
            Journal
          </Link>
        </Flex>
        <Flex gap={2} fontWeight={500}>
          <Tooltipwrapper content="User Account">
            <User size={18} />
          </Tooltipwrapper>
          <Tooltipwrapper content="Search">
            <Search size={18} />
          </Tooltipwrapper>
          <Tooltipwrapper content="Shopping Cart">
            <ShoppingBag size={18} />
          </Tooltipwrapper>
        </Flex>
      </Box>
    </Card.Root>
  );
};

export default Navbar;
