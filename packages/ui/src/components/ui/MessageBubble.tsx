type MessageBubbleProps = {
  message: any;
  isOwn: boolean;
  positionInBlock: "single" | "first" | "middle" | "last";
};

const MessageBubble = ({
  message,
  isOwn,
  positionInBlock,
}: MessageBubbleProps) => {
  // Base classes
  let base = "w-fit max-w-4/5 px-2 py-1 border-personal";

  // Determine which corners should be “lg” vs which “xs”
  let radiusClasses = "";

  if (isOwn) {
    // for your "own" messages (right side)
    switch (positionInBlock) {
      case "single":
        radiusClasses = "rounded-lg rounded-br-xs mt-2"; // full rounding with small bottom-right
        break;
      case "first":
        radiusClasses = "rounded-lg rounded-br-xs mt-2"; // full rounding with small bottom-right
        break;
      case "middle":
        radiusClasses = "rounded-lg rounded-r-xs mt-0.5"; // small rounding on right side
        break;
      case "last":
        radiusClasses = "rounded-lg rounded-tr-xs mt-0.5"; // small rounding on top-right only
        break;
    }
    base += " ml-auto mr-2 bg-white";
  } else {
    // for messages from others (left side)
    switch (positionInBlock) {
      case "single":
        radiusClasses = "rounded-lg rounded-bl-xs mt-2"; // full rounding with small bottom-left
        break;
      case "first":
        radiusClasses = "rounded-lg rounded-bl-xs mt-2"; // full rounding with small bottom-left
        break;
      case "middle":
        radiusClasses = "rounded-lg rounded-l-xs mt-0.5"; // small rounding on left side
        break;
      case "last":
        radiusClasses = "rounded-lg rounded-tl-xs mt-0.5"; // small rounding on top-left only
        break;
    }
    base += " bg-light_sky_blue-800 mr-auto ml-2";
  }
  return (
    <div className={`${base} ${radiusClasses} border-personal  px-2.5 py-1`}>
      {!isOwn && (
        <h3
          className="font-[google_sans_code] text-sm font-semibold opacity-60"
          // style={{ color: messageStyle.color }}
        >
          {message.name}
        </h3>
      )}
      <p
        className={`font-[Bricolage_Grotesque] font-light text-sm/snug`}
        style={{ wordSpacing: "0.1rem" }}
      >
        {message.content}
      </p>
    </div>
  );
};

export default MessageBubble;
