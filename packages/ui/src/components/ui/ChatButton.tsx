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
        initial={{ opacity: 0, x: -10, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        onClick={onChatToggle}
        whileTap={{ scale: 0.95 }}
        className={`lg:w-18 lg:h-8 w-16 h-6 p-4 lg:p-0 cursor-pointer shadow-shinyshadow rounded-l-lg lg:rounded-l-lg flex items-center justify-center gap-1 hover:bg-secondary hover:text-secondary-contrast transition-colors outline-1 outline-global-shadow group ${isChatOpen ? "bg-primary text-primary-contrast" : "bg-secondary text-secondary-contrast"}`}
      >
        {/* <motion.div
          animate={{ rotate: isChatOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IconMessagePlus size={20} stroke={1.5} />
        </motion.div> */}
        <span className="text-xs font-google-sans-code ">
          {isChatOpen ? "close" : "chat"}
        </span>
        <IconMessagePlus
          size={15}
          stroke={1.5}
          className="hidden lg:inline group-hover:scale-110 transition-all duration-200"
        />
      </motion.button>
    </>
  );
};

export default ChatButton;
