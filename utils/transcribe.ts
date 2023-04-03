import axios, { AxiosResponse } from "axios";
import ytdl from "ytdl-core";

async function postData(url: string, withTimestamps: boolean, model: string) {
  try {
    const postResponse: AxiosResponse = await axios.post(
      // `https://ayaanzaveri-whisper-api.hf.space/transcribe?video_url=${url}&model=${model}&word_timestamps=${withTimestamps}`
      `https://ayaanzaveri-faster-whisper-api.hf.space/run/predict`,
      {
        data: [url],
      }
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
