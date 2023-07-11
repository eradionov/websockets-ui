import {createRoomWithUser, getRooms, getUserBySessionId} from "../storage";
import {CommandType} from "../commands";
import {ICommand} from "./command";
import {IResponse} from "../response";
import {WebSocket} from "ws";



export interface RoomResponse extends IResponse {
    type: string,
    data: string,
    id: number
}

export class CreateRoomCommand implements ICommand {
    public process(_: object|undefined, sessionId: string, _1: WebSocket): RoomResponse {
        try {
            const user = getUserBySessionId(sessionId);

            if (undefined === user) {
                throw new Error(`User with sessionId ${sessionId} does not exist`);
            }

            createRoomWithUser(user);

            return {
                type: CommandType.UPDATE_ROOM,
                data: JSON.stringify(getRooms()),
                id: 0,
            } as RoomResponse
        } catch (error) {
            console.error(error);

            return {
                type: CommandType.UPDATE_ROOM,
                data: JSON.stringify(getRooms()),
                id: 0,
            } as RoomResponse
        }
    }
}