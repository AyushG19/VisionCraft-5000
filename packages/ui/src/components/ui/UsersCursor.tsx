import { UserInfo } from "@repo/hooks";
import { IconLocation } from "@tabler/icons-react";

const UsersCursor = ({ color, userId }: UserInfo) => {
  return (
    <IconLocation
      id={`cursor:${userId}`}
      color={color}
      style={{
        position: "absolute",
        top: `0px`,
        left: `0px`,
        rotate: "revert",
        pointerEvents: "none",
      }}
    />
  );
};

export default UsersCursor;
