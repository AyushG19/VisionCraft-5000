import { IconMessagePlus } from "@tabler/icons-react";
import { motion } from "motion/react";
const ChatButton = ({
  onChatToggle,
  isChatOpen,
}: {
  onChatToggle: () => void;
  isChatOpen: boolean;
}) => {
  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        key="chat-button"
        initial={{ opacity: 0, x: -10, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        onClick={onChatToggle}
        whileTap={{ scale: 0.95 }}
        className={`w-18 h-8 p-0 cursor-pointer shadow-shinyshadow rounded-l-lg flex items-center justify-center gap-1 hover:bg-light_sky_blue-700 transition-colors group ${isChatOpen ? "bg-light_sky_blue-700" : "bg-light_sky_blue"}`}
      >
        {/* <motion.div
          animate={{ rotate: isChatOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IconMessagePlus size={20} stroke={1.5} />
        </motion.div> */}
        <span className="text-xs font-normal font-[google_sans_code]">
          Chat
        </span>
        <IconMessagePlus size={15} stroke={1.5} className="group-hover:scale-110 transition-all duration-200" />
      </motion.button>
    </>
  );
};

export default ChatButton;
