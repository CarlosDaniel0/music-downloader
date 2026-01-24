export class RequestSocket {
  clientID;
  serverID;
  execute;
  params;

  constructor(props: {
    clientID: string;
    serverID: string;
    execute: string;
    params?: string[];
  }) {
    this.clientID = props.clientID;
    this.serverID = props.serverID;
    this.execute = props.execute;
    this.params = props.params ?? [];
  }

  toJSON() {
    return JSON.stringify({
      origin: `client.${this.clientID}`,
      target: `server.${this.serverID}`,
      data: { execute: this.execute, params: this.params },
    });
  }
}
