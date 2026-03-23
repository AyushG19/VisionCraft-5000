import { motion, scale } from "motion/react";
import { MessageReceivedType } from "../types";
type MessageBubbleProps = {
  message: MessageReceivedType;
  isOwn: boolean;
  positionInBlock: "single" | "first" | "middle" | "last";
};

function getTimeString(timestamp: number) {
  const date = new Date(timestamp);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// const messageContent = (content: string) => {
//   return (
//     <p
//       className={`font-[google_sans_code] font-light text-xs p-1`}
//       style={{ wordSpacing: "0.1rem" }}
//     >
//       {content}
//     </p>
//   );
// };

const MessageBubble = ({
  message,
  isOwn,
  positionInBlock,
}: MessageBubbleProps) => {
  // Base classes
  let base =
    "w-fit max-w-4/5 px-3 py-2 whitespace-pre-wrap break-words max-w-[80%] m-0.5";

  // Determine which corners should be “lg” vs which “xs”
  let radiusClasses = "";

  if (isOwn) {
    // for your "own" messages (right side)
    switch (positionInBlock) {
      case "single":
        radiusClasses = "rounded-2xl rounded-br-xs"; // full rounding with small bottom-right
        break;
      case "first":
        radiusClasses = "rounded-2xl rounded-br-xs"; // full rounding with small bottom-right
        break;
      case "middle":
        radiusClasses = "rounded-2xl rounded-r-xs "; // small rounding on right side
        break;
      case "last":
        radiusClasses = "rounded-2xl rounded-r-xs "; // small rounding on top-right only
        break;
    }
    base += " ml-auto bg-white";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className={`${base} ${radiusClasses}`}
      >
        <div className="relative pb-0.5">
          <p className="font-sans " style={{ lineHeight: "1.2rem" }}>
            {message.content}
            <span className="w-8 inline-block"></span>
            <span className="absolute right-0 bottom-0 -mb-1 text-[10px] font-semibold opacity-50">
              {getTimeString(message.timeStamp_ms)}
            </span>
          </p>
        </div>
      </motion.div>
    );
  } else {
    // for messages from others (left side)
    switch (positionInBlock) {
      case "single":
        radiusClasses = "rounded-lg rounded-bl-xs "; // full rounding with small bottom-left
        break;
      case "first":
        radiusClasses = "rounded-lg rounded-bl-xs "; // full rounding with small bottom-left
        break;
      case "middle":
        radiusClasses = "rounded-lg rounded-l-xs "; // small rounding on left side
        break;
      case "last":
        radiusClasses = "rounded-lg rounded-l-xs"; // small rounding on top-left only
        break;
    }
    base += " bg-light_sky_blue-800 mr-auto ";
  }
  return (
    <div className="flex items-end gap-1.5 ">
      {positionInBlock === "last" || positionInBlock === "single" ? (
        <div className="size-7 bg-amber-400 rounded-full border flex justify-center items-center capitalize text-xs ">
          {message.name[0]}
        </div>
      ) : (
        <div className="size-7 "></div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        className={`${base} ${radiusClasses} `}
      >
        <div className="relative pb-0.5">
          <p className="font-sans " style={{ lineHeight: "1.2rem" }}>
            {message.content}
            <span className="w-8 inline-block"></span>
            <span className="absolute right-0 bottom-0 -mb-1 text-[10px] font-semibold opacity-50">
              {getTimeString(message.timeStamp_ms)}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MessageBubble;
