import { UserInfo } from "@repo/hooks";
import { IconSend } from "@tabler/icons-react";

const UsersCursor = ({ color, userId }: UserInfo) => {
  return (
    <IconSend
      id={`cursor:${userId}`}
      color={color}
      style={{
        position: "absolute",
        top: `0px`,
        left: `0px`,
        pointerEvents: "none",
      }}
    />
  );
};

export default UsersCursor;
