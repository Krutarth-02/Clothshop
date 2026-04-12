import React from "react";
import CommonDrawer from "../common/CommonDrawer";
import { Box } from "@mantine/core";

const NotificationDrawer = ({ open, handleClose }) => {
  return (
    <Box>
      <CommonDrawer open={open} handleClose={handleClose} title="Notifications">
        <p>No new notifications</p>
      </CommonDrawer>
    </Box>
  );
};

export default NotificationDrawer;
