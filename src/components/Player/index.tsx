import { base64ToArrayBuffer } from "@/utils/functions";
import { type AudioStream } from "@/utils/types";
import { useEffect, useRef } from "react";

interface PlayerProps {
  stream: AudioStream[];
}

export default function Player(props: PlayerProps) {
  const { stream } = props;
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaSourceRef = useRef<MediaSource>(null);
  const sourceBufferRef = useRef<SourceBuffer>(null);

  // const changeVolume = (percent: number) => {
  //   if (!audioRef.current) return
  //   audioRef.current.volume = percent / 100
  // }

  // const changeProgress = (seconds: number) => {
  //   if (!audioRef.current) return
  //   audioRef.current.currentTime = seconds
  // }

  const handleAudio = (res: AudioStream) => {
    const { content, duration, end } = res;
    const buffer = base64ToArrayBuffer(content);
    const audio = audioRef.current!;
    const mediaSource = mediaSourceRef.current!;
    if (!audio.src) audio.src = URL.createObjectURL(mediaSource);
    const run = () => {
      if (sourceBufferRef.current) sourceBufferRef.current.appendBuffer(buffer);
    };

    mediaSource.addEventListener("sourceopen", async () => {
      sourceBufferRef.current = mediaSource.addSourceBuffer("audio/mpeg");
      run();
      await new Promise((resolve) =>
        sourceBufferRef.current && sourceBufferRef.current.addEventListener(
          "updateend",
          () => {
            if (mediaSource.readyState === "open")
              mediaSource.duration = duration;
            resolve(true);
            if (end) return mediaSource.endOfStream();
          },
          {
            once: true,
          }
        )
      );
      audio.play();
    });

    run();
  };

  useEffect(() => {
    if (!stream.length) return
    const s = stream.shift()
    if (s) handleAudio(s)
  }, [stream]);

  useEffect(() => {
    mediaSourceRef.current = new MediaSource();
  }, []);

  return <audio ref={audioRef} autoPlay />;
}
