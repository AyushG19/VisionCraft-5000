import {
  IconDoorEnter,
  IconDoorExit,
  IconLogin2,
  IconMessages,
  IconSparkles,
  IconSquareRoundedPlus,
  IconSquareRoundedPlusFilled,
  IconUser,
} from "@tabler/icons-react";

export const ROOM_OPTIONS = [
  {
    id: "create",
    label: "new Room",
    mode: "normal",
    icon: IconSquareRoundedPlus,
  },
  {
    id: "join",
    label: "Join Room",
    mode: "normal",
    icon: IconDoorEnter,
  },
  {
    id: "ai-chat",
    label: "Ask AI",
    mode: "normal",
    icon: IconSparkles,
  },
  {
    id: "room-chat",
    label: "Open Chat",
    mode: "room",
    icon: IconMessages,
  },
  {
    id: "themes",
    label: "Themes",
    mode: "both",
    icon: IconSquareRoundedPlusFilled,
  },
  {
    id: "profile",
    label: "Profile",
    mode: "both",
    icon: IconUser,
  },
  {
    id: "logout",
    label: "Logout",
    mode: "normal",
    icon: IconLogin2,
  },
  {
    id: "exit-room",
    label: "Exit Room",
    mode: "room",
    icon: IconDoorExit,
  },
] as const;

export type OptionId = (typeof ROOM_OPTIONS)[number]["id"];
