import { parse } from "node:url";
import {
  createServer,
  Server,
  IncomingMessage,
  ServerResponse,
} from "node:http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";
import { Socket } from "node:net";
import { randomUUID } from "node:crypto";
import { WebsocketClient } from "@/utils/types";
import { networkInterfaces } from "node:os";

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const websockets: WebsocketClient[] = [];

nextApp.prepare().then(() => {
  const server: Server = createServer(
    (req: IncomingMessage, res: ServerResponse) => {
      handle(req, res, parse(req.url || "", true));
    },
  );

  const sendServers = () => {
    websockets
      .filter((w) => w.role === "client")
      .forEach((w) =>
        w.client?.send(
          JSON.stringify({
            origin: "ws",
            target: "client",
            data: {
              execution: "servers",
              result: websockets.filter((w) => w.role === "server"),
            },
          }),
        ),
      );
  };

  const response = (client: WebSocket, message: Buffer, isBinary: boolean) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message, { binary: isBinary });
    }
  };

  const getIPv4 = () => {
    const interfaces = networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const inter of interfaces[name]!) {
        if (inter.family === "IPv4" && !inter.internal) return inter.address;
      }
    }
    return "10.0.0.79";
  };

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    if (dev) console.log("New client connected");
    const id = randomUUID();
    websockets.push({ id, client: ws });
    ws.send(
      JSON.stringify({
        origin: "ws",
        target: "",
        data: { execution: "id", result: id },
      }),
    );

    ws.on("message", (message: Buffer, isBinary: boolean) => {
      if (dev) console.log(`Message received: ${message}`);
      const data = String(message);

      const websocket = websockets.find((websocket) => websocket.client === ws);
      if (/role:(client|server)/g.test(data) && websocket) {
        const role = data.match(/(?<=role:)\w+/g)?.[0];
        const name = data.match(/(?<=name:).*/g)?.[0];
        websocket.role = role as "client" | "server";
        websocket.name = name;

        if (["server", "client"].includes(role ?? "")) sendServers();
      }

      websockets.forEach(({ role, client, id }) => {
        if (
          (role === "client" && data.includes(`"target":"client.${id}"`)) ||
          (role === "server" && data.includes(`"target":"server.${id}"`))
        )
          response(client!, message, isBinary);
      });
    });

    ws.on("close", () => {
      const index = websockets.findIndex(
        (websocket) => websocket.client === ws,
      );
      if (index !== -1) {
        console.log(`Client disconnected: ${websockets[index].role}`);
        websockets.splice(index, 1);
        sendServers();
      }
    });
  });

  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    const { pathname } = parse(req.url || "/", true);

    if (pathname === "/_next/webpack-hmr") {
      nextApp.getUpgradeHandler()(req, socket, head);
    }

    if (pathname === "/api/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  server.listen(3000);
  console.log(
    `Server is running 🚀 \n    http://${getIPv4()}:3000\n    http://localhost:3000`,
  );
});
