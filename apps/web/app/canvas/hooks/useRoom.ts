// import { UserInfo, useSocketContext } from "@repo/hooks";
// import { joinRoomService, leaveRoomService } from "app/services/canvas.service";
// import React, { useState } from "react";
// import { disconnect } from "process";
// import { getUserColor } from "app/lib/color.helper";
// import { Action } from "../types";
// import { UserType } from "@repo/common";

// const useRoom = (canvasDispatch: (action: Action) => void) => {
//   const { inRoom, setInRoom, roomInfo, setRoomInfo, setToken } =
//     useSocketContext();

//   const generateUserObject = (user: UserType) => {
//     return {
//       ...user,
//       color: getUserColor(user.userId),
//       cursor: null,
//     };
//   };
//   const handleJoinRoom = async (code: string) => {
//     try {
//       const data = await joinRoomService(code);
//       const roomUsers = data.users.map((user) => generateUserObject(user));
//       setRoomInfo({
//         ...roomInfo,
//         roomId: data.roomId,
//         slug: code,
//         users: roomUsers,
//       });

//       canvasDispatch({ type: "INITIALIZE_BOARD", payload: data.canvasState });

//       setToken(data.token);
//       connect(data.roomId, code, data.token);

//       console.log("From page handleJoinRoom: ", data);
//     } catch (error) {
//       //@ts-ignore
//       console.error("error in join room : ", error.message);
//     }
//   };

//   const handleLeaveRoom = async () => {
//     try {
//       disconnect();
//       setRoomInfo({ ...roomInfo, roomId: "", slug: "" });
//       setToken("");

//       console.log("From page handleLeaveRoom: ");
//     } catch (error) {
//       console.error("error in join room");
//     }
//   };

//   const handleChatToggle = () => {
//     setIsOpen((prev) => !prev);
//   };

//   return {
//     inRoom,
//     token,
//     isOpen,
//     setIsOpen,
//     handleJoinRoom,
//     handleLeaveRoom,
//     handleChatToggle,
//   };
// };

// export default useRoom;
