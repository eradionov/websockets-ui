import {addUserToRoom, createGame, getUserBySessionId} from "../storage";
import {AbstractCommand} from "./command";
import {createGameMessage} from "../utils";

export interface RoomRequest {
    indexRoom: number;
}

export class AddUserToRoomCommand extends AbstractCommand {
    public process(roomRequest: RoomRequest, sessionId: string) {
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

            const games = targetRoom.roomUsers.map(user => createGame(targetRoom.roomId, user.sessionId));

            games.forEach(game => {
                const player = game.player;

                game.player.ws.send(createGameMessage(game.id, player.id));
            });
        } catch (error) {
            console.error(error);

            this.ws.send(createGameMessage());
        }
    }
}