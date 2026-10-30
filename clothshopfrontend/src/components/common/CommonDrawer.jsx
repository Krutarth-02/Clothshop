import { Drawer, ScrollArea } from "@mantine/core";
import { SquareX } from "lucide-react";
import Tooltipwrapper from "./Tooltipwrapper";

const CommonDrawer = ({ open, handleClose, title, children, width, overlayProps, closeButtonProps, ...props }) => {
  return (
    <Drawer
      opened={open}
      onClose={handleClose}
      title={title}
      position="right"
      overlayProps={{ backgroundOpacity: 0.5, blur: 4, ...overlayProps }}
      size={width || 'md'}
      scrollAreaComponent={ScrollArea.Autosize}
      closeButtonProps={{
        icon: (
          <Tooltipwrapper label="close" arrowOffset={30}>
            <SquareX
              size={24}
              color="red"
              style={{ cursor: "pointer", borderRadius: "20%", border: "none" }}
            />
          </Tooltipwrapper>
        ),
        ...closeButtonProps,
      }}
      {...props}
    >
      {children}
 
    </Drawer>
  );
};

export default CommonDrawer;
