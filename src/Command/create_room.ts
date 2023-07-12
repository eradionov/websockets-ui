import {createRoomWithUser, getUserBySessionId} from "../storage";
import {AbstractCommand} from "./command";
import {updateRoomMessage, updateWinnersMessage} from "../utils";

export class CreateRoomCommand extends AbstractCommand {
    public process(_: object|undefined, sessionId: string) {
        try {
            const user = getUserBySessionId(sessionId);

            if (undefined === user) {
                throw new Error(`User with sessionId ${sessionId} does not exist`);
            }

            createRoomWithUser(user);
        } catch (error) {
            console.error(error);
        }

        const rooms = updateRoomMessage();
        const updatedWinners = updateWinnersMessage();

        this.wss.clients.forEach(client => {
            client.send(rooms);
            client.send(updatedWinners);
        });
    }
}