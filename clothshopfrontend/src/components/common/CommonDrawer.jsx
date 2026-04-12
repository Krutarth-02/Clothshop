import React from "react";
import {
  Button,
  Drawer,
  Group,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { SquareX } from "lucide-react";
import toast from "react-hot-toast";
import Tooltipwrapper from "./Tooltipwrapper";

const CommonDrawer = ({ open, handleClose, title, children }) => {
  return (
    <Drawer
      opened={open}
      onClose={handleClose}
      title={title}
      position="right"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      size="md"
      scrollAreaComponent={ScrollArea.Autosize}
      closeButtonProps={{
        icon: (
          <Tooltipwrapper label='close' arrowOffset={30}>
            <SquareX
              size={24}
              color="red"
              style={{ cursor:'pointer', borderRadius: "20%" ,border:'none' }}
            />
          </Tooltipwrapper>
        ),
      }}
    >
      {children}
      <Group mt="lg" justify="flex-end">
        <Button onClick={handleClose} variant="default">
          Cancel
        </Button>
        <Button onClick={() => toast.error("confirm-action")}>Delete</Button>
      </Group>
    </Drawer>
  );
};

export default CommonDrawer;
