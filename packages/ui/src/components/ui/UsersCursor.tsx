import { UserInfo } from "@repo/hooks";
import { IconLocationFilled } from "@tabler/icons-react";

const UsersCursor = ({ color, userId }: UserInfo) => {
  return (
    <IconLocationFilled
      id={`cursor:${userId}`}
      color={color}
      stroke={1}
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
