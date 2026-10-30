import { Avatar } from "@mantine/core";

export default function UserAvatar({ user, imageProps, ...props }) {
  return <Avatar src={user?.image || null} name={user?.fullName}
    alt={user?.fullName || "Profile photo"} radius="xl" color="gray"
    imageProps={{ referrerPolicy: "no-referrer", ...imageProps }} {...props} />;
}
