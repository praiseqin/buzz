import axios, { AxiosResponse } from "axios";

export default async function handler(req: any, res: any) {
  let data = JSON.stringify({
    inputs: req.body.url,
    task: "transcribe",
    return_timestamps: true,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://whisper-jax.ngrok.io/generate/",
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
    res.status(200).json(postResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong" });
  }
}
