import React, { useState } from "react";

const MessageBubble = ({
  index,
  message,
  isOwn,
  messageStyle,
}: {
  index: number;
  message: any;
  isOwn: boolean;
  messageStyle: any;
}) => {
  return (
    <div
      key={index}
      className={`${isOwn ? "bg-white ml-auto rounded-r-xs rounded-tr-xl rounded-l-xl  mr-2" : "rounded-l-xs rounded-r-xl rounded-tl-xl"} w-fit max-w-4/5 ml-2 mb-2 border-personal  px-2.5 py-1`}
    >
      {!isOwn && (
        <h3
          className="font-[google_sans_code] text-sm font-semibold opacity-60"
          style={{ color: messageStyle.color }}
        >
          {messageStyle.name}
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
