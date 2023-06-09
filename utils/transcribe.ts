import axios, { AxiosResponse } from "axios";

async function postData(url: string) {
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "/api/transcribe",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      url: url,
    },
  };

  try {
    const postResponse: AxiosResponse = await axios.request(config);

    if (postResponse.status == 200) {
      // test for status you want, etc
      console.log(postResponse.status);
    }

    console.log(postResponse.data);
    return postResponse.data;
  } catch (error) {
    // console.error(error);
  }
}

export default postData;
