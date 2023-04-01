import axios, { AxiosResponse } from "axios";
import ytdl from "ytdl-core";

async function postData(
  url: string,
  title: any,
  isVideo: any,
  model: any,
  setProgress: any,
  setCallId: any
): Promise<void> {
  try {
    const postResponse: AxiosResponse = await axios.post(
      `https://ayaanzaveri--whisper-audio-transcriber-api-fastapi-app.modal.run/api/transcribe?src_url=${url}&title_slug=${title}&is_video=${isVideo}&model=${model}`
    );

    // console.log('model', model)

    // console.log(postResponse.data);

    setCallId(postResponse.data["call_id"]);

    // Check the status periodically until `finished` is true
    let statusResponse: AxiosResponse | null = null;
    do {
      statusResponse = await axios.get(
        `https://ayaanzaveri--whisper-audio-transcriber-api-fastapi-app.modal.run/api/status/${postResponse.data["call_id"]}`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second before checking again
      // console.log(statusResponse?.data);
      setProgress(statusResponse?.data);
    } while (!statusResponse?.data["finished"]);

    // console.log(postResponse.data["call_id"]);

    // Retrieve the final data using a GET request

    let finalData;

    do {
      const audioResponse: AxiosResponse = await axios.get(
        `https://ayaanzaveri--whisper-audio-transcriber-api-fastapi-app.modal.run/api/audio/${title}`
      );
      finalData = audioResponse.data;
      // console.log(finalData);
    } while (!finalData["segments"]);

    return finalData;
  } catch (error) {
    // console.error(error);
  }
}

export default postData;
