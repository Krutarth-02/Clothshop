import { Card, Text } from "@chakra-ui/react";
import React from "react";

const Announcement = () => {
  return (
    <Card.Root
      bgColor={"black"}
      borderRadius={0}
      border={0}
      height={8}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Text textAlign={"center"} color={"white"} fontSize={12}>
        Sign up for our newsletter and get 15% off your next order
      </Text>
    </Card.Root>
  );
};

export default Announcement;
