import {IResponse} from "../response";
import {WebSocket} from "ws";

export interface ICommand {
    process(data: object, sessionId: string, ws: WebSocket): IResponse
}