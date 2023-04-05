import axios, { AxiosResponse } from "axios";
import ytdl from "ytdl-core";
import { client } from "@gradio/client";

async function postData(url: string) {
  // const payload = {
  //   inputs: url,
  //   task: "transcribe",
  //   return_timestamps: true,
  // };

  let data = JSON.stringify({
    inputs: url,
    task: "transcribe",
    return_timestamps: true,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://cors-anywhere.herokuapp.com/https://whisper-jax.ngrok.io/generate/",
    headers: {
      "Content-Type": "application/json",
    },
    data: data,
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
