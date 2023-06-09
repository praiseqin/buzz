import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import postData from "@/utils/transcribe";
import { useEffect, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  HiCheckCircle,
  HiLightningBolt,
  HiClipboard,
  HiDownload,
  HiDocumentDownload,
} from "react-icons/hi";
import { TbMessage2 } from "react-icons/tb";
import sendMessage from "@/utils/poe";
import ytdl from "ytdl-core";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

interface Segment {
  text: string;
  start: number;
  end: number;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [segments, setSegments] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [text, setText] = useState<string>("");
  const [callId, setCallId] = useState<string>("");
  const [progress, setProgress] = useState<any>(0);
  const [transcribeProgress, setTranscribeProgress] = useState<number>(0);
  const [poeTextRes, setPoeTextRes] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzeText, setAnalyzeText] = useState<string>("");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const [poeModel, setPoeModel] = useState<string>("a2");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [currentAudioTime, setCurrentAudioTime] = useState<number>(0);

  const getAudioUrlFromYoutubeUrl = (url: string) => {
    const videoId = url.split("v=")[1];
    axios.get(`https://pa.il.ax/streams/${videoId}`).then((res) => {
      // console.log(res.data.audioStreams[0].url);
      setAudioUrl(res.data.audioStreams[0].url);
    });
  };

  const transcribe = () => {
    if (!videoUrl) return;
    setIsTranscribing(true);
    // getAudioUrlFromYoutubeUrl(videoUrl);
    postData(videoUrl)
      .then((data) => {
        console.log(data);
        // @ts-ignore
        setSegments(data?.chunks as any);
        setData(data);
      })
      .finally(() => {
        setIsTranscribing(false);
      });
  };

  const poe = (message: string) => {
    setIsAnalyzing(true);
    setPoeTextRes("");
    sendMessage(message, poeModel)
      .then((data) => {
        setPoeTextRes(data);
        // console.log(data);
      })
      .finally(() => {
        setIsAnalyzing(false);
      });
  };

  const formatDuration = (duration: number) => {
    const milliseconds = duration * 1000;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    const millisecondsRemainder = Math.floor(milliseconds % 1000);

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    const formattedMilliseconds = millisecondsRemainder
      .toString()
      .padStart(3, "0");

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  };

  const calculateTranscribeProgress = () => {
    const currentProgress = Math.floor(
      (progress["done_segments"] / (progress["total_segments"] || 1)) * 100
    );

    setTranscribeProgress(currentProgress);
  };

  useEffect(() => {
    calculateTranscribeProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    if (segments?.length > 0) {
      const text = segments
        .map((segment: any) => segment.text)
        .join(" ")
        .replace(/(\r\n|\n|\r)/gm, " ")
        .trim();

      setText(text);
    }
  }, [segments]);

  // console.log(poeTextRes);

  function segmentsToVtt(segments: any[]): string {
    let vttString = "WEBVTT\n\n";

    segments.forEach((segment, index) => {
      const startTime = formatTime(segment.timestamp[0]);
      const endTime = formatTime(segment.timestamp[1]);
      vttString += `${index + 1}\n${startTime} --> ${endTime}\n${
        segment.text
      }\n\n`;
    });

    return vttString;
  }

  function segmentsToSrt(segments: any[]): string {
    let srtString = "";

    segments.forEach((segment, index) => {
      const startTime = formatTime(segment.timestamp[0], true);
      const endTime = formatTime(segment.timestamp[1], true);
      srtString += `${index + 1}\n${startTime} --> ${endTime}\n${
        segment.text
      }\n\n`;
    });

    return srtString;
  }

  function formatTime(seconds: number, isSrt: boolean = false): string {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const secondsFormatted = date.getUTCSeconds().toString().padStart(2, "0");
    const millisecondsFormatted = (seconds - Math.floor(seconds))
      .toFixed(3)
      .slice(2);

    if (isSrt) {
      return `${hours}:${minutes}:${secondsFormatted},${millisecondsFormatted}`;
    } else {
      return `${hours}:${minutes}:${secondsFormatted}.${millisecondsFormatted}`;
    }
  }

  function downloadVtt(segments: Segment[], filename: string): void {
    const vttString = segmentsToVtt(segments);
    const blob = new Blob([vttString], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.vtt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadSrt(segments: Segment[], filename: string): void {
    const srtString = segmentsToSrt(segments);
    const blob = new Blob([srtString], { type: "text/srt" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => {
    if (segments?.length > 0) {
      // console.log(segments?.map((segment: any) => segment.timestamp));
    }
  }, [segments, data]);

  return (
    <div className="flex flex-col items-center font-inter">
      <div className="flex w-10/12 items-start flex-col mt-12 select-none">
        <h1
          className="text-4xl font-bold
          bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-400
        "
        >
          Buzz<span className="text-stone-700 text-3xl">AI</span>
        </h1>
        <span className="text-sm font-semibold text-stone-600">
          Swiftly Transcribe Audio
        </span>
      </div>
      <div className="flex flex-col justify-center mt-8 w-10/12 gap-2">
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-row w-full gap-4">
            {/* make an input with a button */}
            <input
              type="text"
              className="w-full h-12 pl-4 select-none border-none hover:ring-stone-300 shadow-sm ring-1 ring-stone-200 focus:ring-amber-500 focus:ring-2 outline-none rounded-md transition duration-300"
              placeholder="Video URL"
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            {/* <select
              className="w-1/6 h-12 bg-stone-100 select-none border-none font-medium ring-1 focus:ring-2 focus:ring-amber-500 ring-stone-300 hover:ring-stone-400 text-stone-500 hover:cursor-pointer appearance-none text-center rounded-md shadow-sm hover:bg-stone-200 active:bg-stone-300 transition duration-300 outline-none"
              onChange={(e) => setModel(e.target.value)}
              value={model}
            >
              <option value="tiny.en">Tiny</option>
              <option value="base.en">Base</option>
              <option value="small.en">Small</option>
            </select> */}
            <button
              onClick={() => {
                transcribe();
                // getYoutubeAudioUrl();
              }}
              className="w-1/6 h-12 outline-none select-none ring-amber-500 bg-amber-500 text-white font-bold rounded-md shadow-sm hover:bg-amber-600 active:bg-amber-700 transition duration-300"
            >
              Transcribe
            </button>
          </div>
        </div>

        {Object.keys(progress).length && transcribeProgress !== 100 ? (
          <div className="w-full">
            <div className="w-full h-0.5 bg-stone-100 rounded-md">
              <div
                className="h-0.5 bg-amber-500 rounded-md transition-all duration-1000 ease-in-out"
                style={{
                  width: `${transcribeProgress ? transcribeProgress : 0}%`,
                }}
              ></div>
            </div>
          </div>
        ) : null}

        {/* make a list of segments with the text, start, and end */}

        <div className="flex flex-row gap-2">
          <div className="flex flex-col justify-center w-full mt-4">
            {text.length > 0 && isTranscribing == false ? (
              <div className="flex flex-row justify-start gap-4 items-center select-none">
                <div className="flex flex-row items-center gap-2">
                  <span className="font-bold text-stone-600">
                    Transcribed Text
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(text);
                  }}
                  className="px-3 inline-flex gap-1 items-center justify-center h-8 text-sm outline-none bg-stone-100 hover:bg-stone-200 border-none ring-1 focus:ring-2 focus:ring-amber-500 ring-stone-300 hover:ring-stone-400 text-stone-500 font-medium rounded-md shadow-sm transition duration-300"
                >
                  Copy Text
                  <HiClipboard />
                </button>
                <button
                  onClick={() => {
                    downloadVtt(segments, "transcript");
                  }}
                  className="px-3 inline-flex gap-1 items-center justify-center h-8 text-sm outline-none bg-stone-100 hover:bg-stone-200 border-none ring-1 focus:ring-2 focus:ring-amber-500 ring-stone-300 hover:ring-stone-400 text-stone-500 font-medium rounded-md shadow-sm transition duration-300"
                >
                  Download VTT
                  <HiDocumentDownload />
                </button>
                <button
                  onClick={() => {
                    downloadSrt(segments, "transcript");
                  }}
                  className="px-3 inline-flex gap-1 items-center justify-center h-8 text-sm outline-none bg-stone-100 hover:bg-stone-200 border-none ring-1 focus:ring-2 focus:ring-amber-500 ring-stone-300 hover:ring-stone-400 text-stone-500 font-medium rounded-md shadow-sm transition duration-300"
                >
                  Download SRT
                  <HiDocumentDownload />
                </button>
              </div>
            ) : null}
            {/* <div className="flex flex-col justify-center w-full mt-4"> */}
            {/* {audioUrl?.length > 0 ? ( */}
            {/* <AudioPlayer
              className="rounded-lg"
              autoPlay={false}
              src={audioUrl}
              onPlay={(e) => {
                // @ts-ignore
                setCurrentAudioTime(e?.target?.currentTime);
              }}
            /> */}
            {/* ) : null} */}
            {/* </div> */}
            {segments?.length > 0 && isTranscribing == false ? (
              <div className="mx-auto py-2 mt-4 w-full">
                <ul className="bg-white text-stone-900 border rounded-lg overflow-hidden">
                  {" "}
                  {segments?.map((segment: any, index: any) => (
                    <li
                      className="px-6 py-6 border-b odd:bg-white even:bg-stone-50 text-stone-700 relative w-full flex flex-col justify-center gap-2"
                      key={index}
                    >
                      {/* add a circular button to the top right corner */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          {/* map through the words array in each segment */}
                          <div className="flex flex-row items-center gap-1">
                            {segment?.text}
                          </div>
                        </div>
                        <div className="sm:inline-flex sm:flex-row items-center text-xs bg-stone-100 ring-1 ring-stone-200 rounded text-stone-900 dark:text-white select-none">
                          <div className="hover:bg-stone-200 text-stone-600 py-1 px-1.5 rounded-l text-right transition ease-in-out duration-700">
                            <span>
                              🎙{" "}
                              {segment?.timestamp?.length > 0
                                ? formatDuration(segment?.timestamp[0])
                                : null}
                            </span>
                          </div>
                          <span className="text-stone-600 py-1 px-1"> - </span>
                          <div className="hover:bg-stone-200 text-stone-600 py-1 px-1.5 rounded-r text-right transition ease-in-out duration-700">
                            <span>
                              {" "}
                              {segment?.timestamp?.length > 0
                                ? formatDuration(segment?.timestamp[1])
                                : null}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 select-none right-0 p-2 text-xs text-stone-300">
                        {index}
                      </div>

                      {poeTextRes && currentSegmentIndex === index ? (
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500">
                          {poeTextRes}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : // ) : isTranscribing &&
            //   (transcribeProgress == 0 ||
            //     Number.isNaN(Number(transcribeProgress))) &&
            //   Object.keys(progress).length == 1 ? (
            //   <p className="text-orange-500 items-center w-full justify-center font-medium inline-flex gap-2">
            //     Downloading{" "}
            //     <div className="animate-spin">
            //       <div className="animate-spin">
            //         <CgSpinner className="animate-spin" />
            //       </div>
            //     </div>
            //   </p>
            // ) : progress["total_segments"] >= 0 &&
            //   progress["done_segments"] <= 0 ? (
            //   <p className="text-orange-500 items-center w-full justify-center font-medium inline-flex gap-2">
            //     Loading {progress["total_segments"]} Segments
            //     <div className="animate-spin">
            //       <div className="animate-spin">
            //         <CgSpinner className="animate-spin" />
            //       </div>
            //     </div>
            //   </p>
            isTranscribing ? (
              <p className="text-amber-500 items-center w-full mt-2 justify-center font-medium inline-flex gap-2">
                Transcribing{" "}
                <div className="animate-spin">
                  <div className="animate-spin">
                    <CgSpinner className="animate-spin" />
                  </div>
                </div>
              </p>
            ) : (
              <p className="text-stone-400 items-center flex w-full justify-center pt-4">
                No transcript
              </p>
            )}
          </div>
          {/* <div className="flex w-96 flex-col gap-4 border border-stone-200 rounded-md mt-16 p-6">
            <div className="flex flex-row gap-2">
              <input
                type="text"
                className="px-3 gap-1 w-full text-sm h-10 inline-flex items-center justify-center border-none hover:ring-stone-300 shadow-sm ring-1 ring-stone-200 focus:ring-amber-500 focus:ring-2 outline-none rounded transition duration-300"
                onChange={(e) => {
                  setAnalyzeText(e.target.value);
                }}
                placeholder="Ask a question..."
              />
              <button
                className="w-12 inline-flex items-center justify-center outline-none select-none ring-amber-500 bg-amber-500 text-white font-bold rounded-md shadow-sm hover:bg-amber-600 active:bg-amber-700 transition duration-300"
                onClick={() => poe(text + " " + analyzeText)}
              >
                <TbMessage2 className="w-5 h-5" />
              </button>
            </div>
            <span className="text-stone-600">{poeTextRes}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}
