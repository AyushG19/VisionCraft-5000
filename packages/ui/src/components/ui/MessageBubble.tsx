import React from "react";

const MessageBubble = ({ index, message }: { index: number; message: any }) => {
  const senderProps = {};
  return (
    <div
      key={index}
      className="w-4/5 ml-2 mb-1 border-personal rounded-r-xl p-2 "
    >
      <div className="w-4 h-4 ">{message.user.split("")[0]}</div>
    </div>
  );
};

export default MessageBubble;
