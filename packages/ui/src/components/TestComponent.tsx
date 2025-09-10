import React from "react";
import ResizableDiv from "./ui/ResizableDiv";
import ChatModal from "./ChatModal";

const TestComponent = () => {
  return (
    <ResizableDiv minHeight={30} minWidth={100}>
      <ChatModal />
    </ResizableDiv>
  );
};

export default TestComponent;
