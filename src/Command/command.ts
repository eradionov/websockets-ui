import {WebSocket, WebSocketServer} from "ws";

export abstract class AbstractCommand {
    constructor(protected readonly ws: WebSocket, protected readonly wss: WebSocketServer) {
    }

    public abstract process(data: object, sessionId: string): void;
}