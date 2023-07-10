import {addUserToRoom, getRooms, getUserBySessionId} from "../storage";
import {CommandType} from "../commands";
import {ICommand} from "./command";
import {RoomResponse} from "./create_room";

export interface RoomRequest {
    indexRoom: number;
}
export class AddUserToRoomCommand implements ICommand {
    public process(roomRequest: RoomRequest, sessionId: string): RoomResponse {
        try {
            const user = getUserBySessionId(sessionId);

            if (undefined === user) {
                throw new Error(`User with sessionId ${sessionId} does not exist`);
            }

            addUserToRoom(roomRequest.indexRoom, sessionId);

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