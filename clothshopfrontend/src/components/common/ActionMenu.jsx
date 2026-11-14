import { Button, Menu } from "@mantine/core";
import { Link } from "react-router-dom";

export const ActionMenuItems = ({ items = [], disabled = false, mobile = false, onAction }) => {
  const Item = mobile ? Button : Menu.Item;
  return items.map(({ key, label, icon, to, action, danger, disabled: itemDisabled, ...props }) => (
    <Item key={key || label} {...(to ? { component: Link, to } : {})}
      leftSection={icon} color={danger ? "red" : mobile ? "gray" : undefined}
      {...(mobile ? {
        variant: "subtle", fullWidth: true, radius: "md", px: 12,
        styles: {
          inner: { justifyContent: "flex-start", gap: 12 },
          section: { marginInline: 0, flexShrink: 0 },
          label: { fontSize: 14, fontWeight: 500, whiteSpace: "normal" },
        },
      } : {})}
      {...props} disabled={disabled || itemDisabled}
      style={{ minHeight: 44, ...(mobile ? { height: "auto", justifyContent: "flex-start", textAlign: "left" } : {}), ...props.style }}
      onClick={() => { onAction?.(); if (action) void action(); }}>
      {label}
    </Item>
  ));
};

const ActionMenu = ({ target, items, label, disabled, onAction, ...props }) => {
  return <Menu position="bottom-end" withinPortal shadow="md" {...props}>
    <Menu.Target>{target}</Menu.Target>
    <Menu.Dropdown>
      {label && <Menu.Label style={{ overflowWrap: "anywhere" }}>{label}</Menu.Label>}
      <ActionMenuItems items={items} disabled={disabled} onAction={onAction} />
    </Menu.Dropdown>
  </Menu>;
};

export default ActionMenu;
