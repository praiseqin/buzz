import axios from "axios";

const sendMessage = async (message: string) => {
  const data = JSON.stringify({
    message: message,
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://poeapi-1-x0607863.deta.app/message",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data.response;
  } catch (error) {
    console.log(error);
  }
};

export default sendMessage;
