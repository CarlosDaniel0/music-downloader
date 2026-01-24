/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import SongTile from "@/components/SongTile";
import Status from "@/components/Status";
import { RequestSocket } from "@/entities/RequestSocket";
import { AudioStream, SocketData, Track, WebsocketClient } from "@/utils/types";
import { Music, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";

export default function Home() {
  const [form, setForm] = useState({
    artist: "",
    track: "",
    serverID: "",
    clientID: "",
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const [servers, setServers] = useState<WebsocketClient[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const methods: Record<string, Function> = {
    get_track: (track: Track) => {
      console.log(track);
      setForm((prev) => ({ ...prev, artist: "", track: "" }));
      setTracks((prev) => [...prev, { ...track, stream: [] }]);
    },
    stream_audio: (audio: AudioStream) => {
      return setTracks((prev) =>
        prev.map((track) =>
          track.file === audio.file
            ? { ...track, stream: [...track.stream, audio] }
            : track
        )
      );
    },
    servers: (clients: WebsocketClient[]) => {
      if (clients.length === 1)
        setForm((prev) => ({
          ...prev,
          serverID: clients[0].id ?? "",
        }));
      return setServers(clients);
    },
    id: (id: string) => {
      setForm((prev) => ({ ...prev, clientID: id }));
    },
  };

  const connect = () => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);

    wsRef.current = ws;
    ws.onopen = () => {
      ws.send("role:client");
      setConnectionStatus("connected");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    ws.onmessage = (event) => {
      try {
        const res: SocketData<
          Track | AudioStream | WebsocketClient[] | string
        > = JSON.parse(event.data);

        methods[res.data.execution](res.data.result);
      } catch {}
    };
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
  };

  const handleBlurPage = () => {
    if (connectionStatus === "connected") disconnect();
  };

  const handleFocusPage = () => {
    if (connectionStatus === "disconnected") connect();
  };

  const addEvents = () => {
    window.addEventListener("blur", handleBlurPage);
    window.addEventListener("focus", handleFocusPage);
  };

  const removeEvents = () => {
    window.removeEventListener("blur", handleBlurPage);
    window.removeEventListener("focus", handleFocusPage);
  };

  const handlePlay = (track: Track) => {
    wsRef.current!.send(
      new RequestSocket({
        clientID: form.clientID,
        serverID: form.serverID,
        execute: "stream_audio",
        params: [track.file],
      }).toJSON()
    );
  };

  useEffect(() => {
    connect();
    addEvents();
    return () => {
      disconnect();
      removeEvents();
    };
  }, []);

  const handleChange =
    (target: keyof typeof form) =>
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = evt.currentTarget;
      setForm((prev) => ({ ...prev, [target]: value }));
    };

  const handleChangeServer = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = evt.currentTarget;
    setForm((prev) => ({ ...prev, serverID: value }));
  };

  const handleDownload = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const { artist, track: searchTrack } = form;
    console.log(form);
    if (!form.serverID) return;
    wsRef.current!.send(
      new RequestSocket({
        clientID: form.clientID,
        serverID: form.serverID,
        execute: "get_track",
        params: [artist, searchTrack],
      }).toJSON()
    );
  };

  return (
    <div className="min-h-dvh flex flex-col h-100 max-w-[500px] pt-4 m-auto">
      <div className="flex justify-between gap-8 px-2">
        <div className="flex flex-col align-middle self-center">
          <span>Status:</span>
          <Status type={connectionStatus} />
        </div>

        <div>
          <label htmlFor="Headline">
            <span className="text-sm font-medium text-gray-700">
              {" "}
              Servidores{" "}
            </span>

            <select
              name="Headline"
              id="Headline"
              className="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm"
              value={form.serverID}
              onChange={handleChangeServer}
            >
              <option value="" hidden>
                Selecione...
              </option>
              {servers.map((server, i) => (
                <option
                  key={`SS${server.id?.substring(0, 5) ?? ""}${i}`}
                  value={server.id}
                >
                  {server.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div>
        <h4 className="text-3xl text-center">Baixar Música</h4>
        <form
          onSubmit={handleDownload}
          className="flex flex-col align-middle px-2"
        >
          <label htmlFor="Artist">
            <span className="text-sm font-medium text-gray-700"> Artista </span>
            <div className="relative">
              <input
                type="text"
                id="Artist"
                required
                className="mt-0.5 w-full rounded border-gray-300 p-2 pe-6 shadow-sm sm:text-sm"
                value={form.artist}
                onChange={handleChange("artist")}
              />
              <span className="absolute inset-y-0 right-0 grid w-8 place-content-center text-gray-700">
                <User className="size-4" />
              </span>
            </div>
          </label>

          <label htmlFor="Track">
            <span className="text-sm font-medium text-gray-700"> Música </span>
            <div className="relative">
              <input
                type="text"
                id="Track"
                required
                value={form.track}
                onChange={handleChange("track")}
                className="mt-0.5 w-full rounded border-gray-300 p-2 pe-6 shadow-sm sm:text-sm"
              />
              <span className="absolute inset-y-0 right-0 grid w-8 place-content-center text-gray-700">
                <Music className="size-4" />
              </span>
            </div>
          </label>

          <button
            className="mt-2 inline-block rounded-sm border border-indigo-600 bg-indigo-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-indigo-600 focus:ring-3 focus:outline-hidden"
            type="submit"
          >
            Baixar
          </button>
        </form>
      </div>
      {!!tracks.length && (
        <>
          <p className="text-xl text-center mt-2">Baixados</p>
          <div style={{ height: "calc(100% - 235px)" }}>
            <Virtuoso
              data={tracks}
              itemContent={(i, track) => (
                <SongTile key={`ST${i}`} track={track} onPlay={handlePlay} />
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
