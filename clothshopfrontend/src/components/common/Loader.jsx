import { Center, Loader } from "@mantine/core";

export default function LoadingState({ label = "Loading", minHeight = "60vh", size, ...props }) {
  return <Center mih={minHeight} {...props}><Loader size={size} aria-label={label} /></Center>;
}
