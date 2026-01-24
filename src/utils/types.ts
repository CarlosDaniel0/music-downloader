import { WebSocket } from "ws";

export interface WebsocketClient {
  id?: string;
  client?: WebSocket;
  name?: string,
  role?: "client" | "server";
}

export interface Track {
  spotify: {
    title: string;
    artist: string;
    album: string;
    genre?: string;
    year: string;
    track_number: number;
    total_tracks: number;
    cover: string;
  };
  youtube: {
    video_tag: string;
    title: string;
    published: string;
    cover: string;
  };
  duration: number,
  stream: AudioStream[],
  file: string;
  name: string;
}

export interface AudioStream {
  content: string,
  duration: number,
  size: number,
  end: boolean,
  file: string
}

export interface SocketData<T> {
  origin: "server";
  target: "client";
  data: {
    execution: string;
    result: T;
  };
}
