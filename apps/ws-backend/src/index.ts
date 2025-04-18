import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 3000 });
console.log("ready");

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}
const users: User[] = [];

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", (data) => {
    let stringData = typeof data === "string" ? data : data.toString();
    try {
      console.log(stringData);
      const parsedData = JSON.parse(stringData);
      if (parsedData.type === "joinRoom") {
        console.log("joining room");
        users.forEach((user) => {
          if (user.userId === parsedData.userId) {
            user.rooms.push(parsedData.roomId);
            user.ws.send("joined");
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  ws.send("something");
});
