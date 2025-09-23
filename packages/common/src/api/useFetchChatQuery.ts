import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { axiosInstance } from "./index";

interface Message {
  sender_id: string;
  name: string;
  timestamp_ms: Date;
  content: string;
}
export default function useFetchChat(
  roomId: string
): UseQueryResult<Message[] | Error> {
  return useQuery<Message[] | Error>({
    queryKey: ["chat", roomId],
    queryFn: async () => {
      const res = await axiosInstance.get("api/rooms/chat", {
        params: { roomId: roomId },
      });
      return res.data;
    },
    enabled: Boolean(roomId),
  });
}
