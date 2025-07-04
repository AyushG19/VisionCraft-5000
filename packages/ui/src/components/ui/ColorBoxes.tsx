import React from "react";

const ColorBoxes = () => {
  return (
    <div className="grid grid-rows-2 gap-2.5 items-center justify-center m-2">
      <div className="w-4.5 h-4.5 bg-white  outline-personal rounded"></div>
      <div className="w-4.5 h-4.5 bg-black outline-personal rounded"></div>
      <div className="w-4.5 h-4.5 bg-yellow-400 outline-personal rounded"></div>
    </div>
  );
};

export default ColorBoxes;
