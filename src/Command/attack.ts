import {ICommand} from "./command";
import {WebSocket} from "ws";
import {findGameById, Game} from "../storage";
import {CommandType} from "../commands";

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

export class AttackCommand implements ICommand {
    process(data: IAttack, sessionId: string, _: WebSocket): undefined {
        const gameParticipantData = findGameById(data.gameId);
        const counterPlayerGame: Game|undefined = gameParticipantData.find(game => game.player.sessionId !== sessionId);
        const currentPlayerGame: Game|undefined = gameParticipantData.find(game => game.player.sessionId === sessionId);

        if (counterPlayerGame === undefined) {
            throw new Error('Game logic error');
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

            if (data.x >= xStart && data.x <= xEnd && data.y >= yStart && data.y <= yEnd) {
                ship.hit = (isNaN(ship.hit) ? 0 : ship.hit) + 1;
                attackResponse.data.status = ship.hit >= ship.length ? HitType.KILLED : HitType.SHOT;
                break;
            }
        }

        currentPlayerGame?.player.ws.send(JSON.stringify({
            type: attackResponse.type,
            data: JSON.stringify(attackResponse.data),
            id: attackResponse.id
        }));

        currentPlayerGame?.player.ws.send(JSON.stringify({
            type: CommandType.TURN,
            data: JSON.stringify({
                currentPlayer: currentPlayerGame.player.id,
            }),
            id: 0,
        }));
    }
}