import {CommandType} from "./commands";
import {findGameByIdAndUserIndex, Game, getRooms, getWinnersList} from "./storage";
import {HitType} from "./Command/attack";

const MAX_MATRIX_SIZE = 9;

export const updateRoomMessage = () => {
    return JSON.stringify({
        type: CommandType.UPDATE_ROOM,
        data: JSON.stringify(getRooms()),
        id: 0,
    });
};

export const gameTurnMessage = (currentPlayerId: number) => {
  return JSON.stringify({
      type: CommandType.TURN,
      data: JSON.stringify({
          currentPlayer: currentPlayerId,
      }),
      id: 0,
  });
};

export const createGameMessage = (gameId?: number, playerId?: number) => {
    const data = gameId !== undefined && playerId !== undefined ? {
        idGame: gameId,
        idPlayer: playerId
    } : [];

    return JSON.stringify({
        type: CommandType.CREATE_GAME,
        data: JSON.stringify(data),
        id: 0,
    });
};

export const startGameMessage = (game: Game) => {
    return JSON.stringify({
        type: CommandType.START_GAME,
        data: JSON.stringify({
            ships: game.ships,
        }),
        currentPlayerIndex: game.player.id
    });
};

export const registrationMessage = (username: string, userIndex: number, hasError: boolean, errorMessage: string = '') => {
    return JSON.stringify({
        type: CommandType.REGISTRATION,
        data: JSON.stringify({
            name: username,
            index: userIndex,
            error: hasError,
            errorText: errorMessage
        }),
        id: 0
    })
};

export const finishGameMessage = (winPlayerId: number) => {
    return JSON.stringify({
        type: CommandType.FINISH,
        data: JSON.stringify({winPlayer: winPlayerId}),
        id: 0
    });
}

export const updateWinnersMessage = () => {
    const winners = getWinnersList();
    const winnersData: Array<{name: string, wins: number}> = [];

    winners.forEach(winner => {
        winnersData.push({
            name: winner.player.name,
            wins: winner.wins
        });
    })

  return JSON.stringify(
      {
          type: CommandType.UPDATE_WINNERS,
          data: JSON.stringify(winnersData),
          id: 0,
      }
  );
};

export interface AttackResponseData {
    position: {
        x: number;
        y: number;
    }
    currentPlayer: number;
    status: HitType;
}

export const attackTypeMessage = (data: AttackResponseData, attackType: HitType, attackResponseId: number) => {
    return JSON.stringify({
        type: attackType,
        data: JSON.stringify(data),
        id: attackResponseId
    });
};

export const getRandomAttackCoords = (gameId: number, userIndexId: number): {x: number, y:number} => {
    const game = findGameByIdAndUserIndex(gameId, userIndexId);

    if (game === undefined || game.ships.length === 0) {
        throw new Error('Game logic error');
    }

    const hitCoords: Array<string> = [];

    game.ships.forEach(ship => {
       if (ship.coordHits !== undefined) {
           hitCoords.push(...ship.coordHits.keys());
       }
    });

    let coords: Record<number, number> = getRandomCoords();

    while (hitCoords.includes(`${coords[0]}:${coords[1]}`)) {
        coords = getRandomCoords();
    }

    return {
        x: coords[0]!,
        y: coords[1]!,
    };
}

const getRandomCoords = (): Record<number, number> => {
    return [Math.ceil(Math.random() * MAX_MATRIX_SIZE), Math.ceil(Math.random() * MAX_MATRIX_SIZE)];
}
