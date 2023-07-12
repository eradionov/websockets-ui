import {AbstractCommand} from "./command";
import {findGameById, Game} from "../storage";
import {CommandType} from "../commands";
import {finishGameMessage, gameTurnMessage, updateWinnersMessage} from "../utils";

export interface IAttack {
    x: number;
    y: number;
    gameId: number;
    indexPlayer: number;
}

export enum HitType {
    MISSED = 'miss',
    KILLED = 'killed',
    SHOT = 'shot'
}

interface AttackResponse {
    type: string;
    data: {
        position: {
            x: number;
            y: number;
        }
        currentPlayer: number;
        status: HitType;
    },
    id: 0,
}

export class AttackCommand extends AbstractCommand{
    process(data: IAttack, sessionId: string) {
        const gameParticipantData = findGameById(data.gameId);
        const counterPlayerGame: Game|undefined = gameParticipantData.find(game => game.player.sessionId !== sessionId);
        const currentPlayerGame: Game|undefined = gameParticipantData.find(game => game.player.sessionId === sessionId);

        if (currentPlayerGame === undefined || counterPlayerGame === undefined) {
            throw new Error('Game logic error');
        }

        if (this.checkGameForCompletion(currentPlayerGame, counterPlayerGame)) {
            return;
        }

        const ships = counterPlayerGame.ships;
        let attackResponse = {
            type: CommandType.ATTACK,
            data: {
                position: {
                    x: data.x,
                    y: data.y,
                },
                currentPlayer: currentPlayerGame?.player.id,
                status: HitType.MISSED
            },
            id: 0,
        } as AttackResponse;

        for (const ship of ships) {
            const xStart = ship.position.x;
            const xEnd = !ship.direction ? ship.position.x + (ship.length - 1) : ship.position.x;
            const yStart = ship.position.y;
            const yEnd = ship.direction ? ship.position.y + (ship.length - 1): ship.position.y;

            ship.coordHits = ship.coordHits === undefined ? new Map<string, string>() : ship.coordHits;

            if (data.x >= xStart && data.x <= xEnd && data.y >= yStart && data.y <= yEnd) {
                const alreadyHit = ship.coordHits.has(`${data.x}:${data.y}`);

                if (alreadyHit) {
                    attackResponse.data.status = ship.coordHits.get(`${data.x}:${data.y}`) as HitType;
                    console.log(attackResponse.data.status);
                    currentPlayerGame.player.ws.send(JSON.stringify({
                        type: attackResponse.type,
                        data: JSON.stringify(attackResponse.data),
                        id: attackResponse.id
                    }));

                    continue;
                }

                ship.hit = (isNaN(ship.hit) ? 0 : ship.hit) + 1;
                attackResponse.data.status = ship.hit >= ship.length ? HitType.KILLED : HitType.SHOT;
                ship.coordHits.set(`${data.x}:${data.y}`, `${attackResponse.data.status}`);

                break;
            }
        }

        currentPlayerGame.player.ws.send(JSON.stringify({
            type: attackResponse.type,
            data: JSON.stringify(attackResponse.data),
            id: attackResponse.id
        }));

        if (this.checkGameForCompletion(currentPlayerGame, counterPlayerGame)) {
            return;
        }

        currentPlayerGame.player.ws.send(gameTurnMessage(counterPlayerGame!.player.id));
        counterPlayerGame.player.ws.send(gameTurnMessage(counterPlayerGame!.player.id));
    }

    private checkGameForCompletion(currentPlayerGame: Game, counterPlayerGame: Game): boolean {
        const currentPlayerKilledShips = currentPlayerGame.ships.filter(ship => ship.hit === ship.length);
        const counterPlayerKilledShips = counterPlayerGame.ships.filter(ship => ship.hit === ship.length);

        if (currentPlayerKilledShips.length === currentPlayerGame.ships.length && !counterPlayerGame.gameCompleted) {
            ++counterPlayerGame.wins;
            counterPlayerGame.gameCompleted = true;
            currentPlayerGame.gameCompleted = true;

            this.sendCommandEvents([
                finishGameMessage(counterPlayerGame.player.id),
                updateWinnersMessage()
            ]);

            return true;
        }

        if (counterPlayerKilledShips.length === counterPlayerGame.ships.length && !currentPlayerGame.gameCompleted) {
            ++currentPlayerGame.wins;
            counterPlayerGame.gameCompleted = true;
            currentPlayerGame.gameCompleted = true;

            this.sendCommandEvents([
                finishGameMessage(currentPlayerGame.player.id),
                updateWinnersMessage()
            ]);
            return true;
        }

       return false;
    }

    private sendCommandEvents(messages: Array<string>) {
        this.wss.clients.forEach(client => {
            messages.forEach(message => {
                client.send(message);
            })
        });
    }
}