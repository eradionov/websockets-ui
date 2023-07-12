import {AbstractCommand} from "./command";
import {addShipsToGame, findGameById, Game, getGameReadiness, Ship} from "../storage";
import {gameTurnMessage, startGameMessage} from "../utils";

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
            hit: 0;
        }
    ]
}

export class AddShipsCommand extends AbstractCommand {
    public process(shipRequest: ShipsRequest, sessionId: string):undefined {
        let {ships} = shipRequest;
        const gameId = shipRequest.gameId;

        const gameParticipantData = findGameById(gameId);
        const currentPlayerGame: Game|undefined = gameParticipantData.find(game => game.player.sessionId === sessionId);

        if (currentPlayerGame === undefined) {
            throw new Error('Current player game was not found');
        }

        addShipsToGame(shipRequest.gameId, sessionId, <Ship[]>ships);

        if (!getGameReadiness(gameId)) {

            this.ws.send(gameTurnMessage(currentPlayerGame!.player.id));

            return;
        }

        const games = findGameById(gameId);

        games.forEach(game => {
            game.player.ws.send(startGameMessage(game));
        });
    }
}