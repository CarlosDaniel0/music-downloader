import { Dot, EllipsisVertical, Music4, Tag } from "lucide-react";
import Image from "next/image";
import Circle from "../Progress/Circle";
import { Track } from "@/utils/types";
import Player from "../Player";

interface SongTileProps {
  onPlay: (track: Track) => void;
  track: Track
}

export default function SongTile(props: SongTileProps) {
  const { track, onPlay } = props;
  const { cover, title, artist, album } = track?.spotify ?? {}
  return (
    <div className="flex items-center shadow-lg rounded-2xl border border-slate-200 relative">
      <Image
        alt="Music Folder"
        src={cover}
        width="100"
        height="100"
        className="flex-none rounded-bl-lg rounded-tl-lg bg-slate-100"
        loading="lazy"
      />
      <div className="min-w-0 flex-auto space-y-1 font-semibold rounded-br-lg rounded-tr-lg pl-2 max-h-[75%]">
        <p className="text-slate-500 dark:text-slate-800 leading-6 text-xl line-clamp-2 m-0">
          {title}
        </p>
        <div className="text-gray-500 dark:text-gray-400 text-sm leading-6 flex gap-0.5 truncate">
          <span>{artist}</span>
          <Dot className="-mx-0.5" />
          <span className="truncate">{album}</span>
          <Player stream={track.stream} />
        </div>
        <div className="flex absolute bottom-0.5 gap-1">
          <Tag color="#06633f" size={16} />
          <Music4 color="#06633f" size={16} />
        </div>
        {false && (
          <div className="flex absolute bottom-1 right-0.5 gap-1">
            <div className="w-[28px] text-green-700">
              <Circle />
            </div>
            <button>
              <EllipsisVertical />
            </button>
          </div>
        )}
      </div>
      <div className="w-[42px]">
        <button className="w-[100%]" onClick={() => onPlay(track)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#06633f"
            className="bi bi-play-fill"
            viewBox="0 0 16 16"
          >
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
          </svg>
        </button>
      </div>
    </div>
  );
}
