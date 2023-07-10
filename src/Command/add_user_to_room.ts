import {addUserToRoom, createGame, Game, getUserBySessionId} from "../storage";
import {CommandType} from "../commands";
import {ICommand} from "./command";
import {IResponse} from "../response";
import {WebSocket} from "ws";

export interface RoomRequest {
    indexRoom: number;
}

export interface GameResponse extends IResponse {
    type: string;
    games: Game[];
    id: number;
}

export class AddUserToRoomCommand implements ICommand {
    public process(roomRequest: RoomRequest, sessionId: string, _: WebSocket): GameResponse {
        try {
            const user = getUserBySessionId(sessionId);

            if (undefined === user) {
                throw new Error(`User with sessionId ${sessionId} does not exist`);
            }

            const targetRoom = addUserToRoom(roomRequest.indexRoom, sessionId);

            if (targetRoom === undefined) {
                throw new Error('User to room assignment error.');
            }

            if (targetRoom.roomUsers.length < 2) {
                throw new Error('Game for users can\'t be created.');
            }

            return {
                type: CommandType.CREATE_GAME,
                games: targetRoom.roomUsers.map(user => createGame(targetRoom.roomId, user.sessionId)),
                id: 0
            }  as GameResponse;
        } catch (error) {
            console.error(error);

            return {
                type: CommandType.CREATE_GAME,
                games: [],
                id: 0,
            } as GameResponse;
        }
    }
}