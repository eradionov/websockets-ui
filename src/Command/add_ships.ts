import {ICommand} from "./command";
import {WebSocket} from "ws";
import {addShipsToGame, findGameById, getGameReadiness, Ship} from "../storage";
import {CommandType} from "../commands";

export interface ShipsRequest {
    gameId: number;
    ships: [
        {
            position: {
                x: number;
                y: number;
            };
            length: number;
            type: string;
            direction: boolean;
        }
    ]
}

export class AddShipsCommand implements ICommand {
    public process(shipRequest: ShipsRequest, sessionId: string, _: WebSocket):undefined {
        let {ships} = shipRequest;
        const gameId = shipRequest.gameId;

        addShipsToGame(shipRequest.gameId, sessionId, <Ship[]>ships);

        if (!getGameReadiness(gameId)) {
            return undefined;
        }

        const games = findGameById(gameId);

        if (games === undefined || games.length < 2) {
            throw new Error('Game start issue');
        }

        games.forEach(game => {
            game.player.ws.send(JSON.stringify({
                type: CommandType.START_GAME,
                data: JSON.stringify({
                    ships: JSON.stringify(game.ships)
                }),
                currentPlayerIndex: game.player.id
            }));
        });
    }
}