import { HTTP_BE_URL } from "../../config";

const fetchChat = () => {
  const token = localStorage.getItem("token");
  const res = fetch(HTTP_BE_URL, {
    method: "GET",

    headers: {
      authorization: "beared" + " " + token,
    },
  });
};
