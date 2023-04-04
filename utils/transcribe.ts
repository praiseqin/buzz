import axios, { AxiosResponse } from "axios";
import ytdl from "ytdl-core";
import { client } from "@gradio/client";

async function postData(url: string, withTimestamps: boolean, model: string) {
  try {
    const postResponse: AxiosResponse = await axios.get(
      `https://faster-whisper-api.onrender.com/predict?url=${url}&model=${model}&with_timestamps=${withTimestamps}`
    );

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
