import {AuthenticationCommand, AuthenticationRequest} from "./Command/Authenticate";
import {CreateRoomCommand} from "./Command/create_room";
import {AddUserToRoomCommand, RoomRequest} from "./Command/add_user_to_room";
import {WebSocket} from "ws";
import {AddShipsCommand, ShipsRequest} from "./Command/add_ships";

export enum CommandType {
    REGISTRATION = 'reg',
    SINGLE_PLAY = 'single_play',
    CREATE_ROOM = 'create_room',
    UPDATE_ROOM = 'update_room',
    ADD_TO_ROOM = 'add_user_to_room',
    CREATE_GAME = 'create_game',
    ADD_SHIPS = 'add_ships',
    START_GAME = 'start_game'
}

export const process = (type: CommandType, sessionId: string, data: string, ws: WebSocket) => {
    let parsedData;

    switch (type) {
      case CommandType.REGISTRATION:
          parsedData = JSON.parse(data);

          if (!parsedData.hasOwnProperty('name') || !parsedData.hasOwnProperty('password')) {
            throw new Error('password and name are required properties');
          }

          const authenticationRequest: AuthenticationRequest = {
              name: parsedData.name,
              password: parsedData.password,
          };
          return (new AuthenticationCommand()).process(authenticationRequest, sessionId, ws);
      case CommandType.CREATE_ROOM:
          return (new CreateRoomCommand()).process(undefined, sessionId, ws);
      case CommandType.ADD_SHIPS:
          const shipsRequest: ShipsRequest = JSON.parse(data);
          return (new AddShipsCommand()).process(shipsRequest, sessionId, ws);
      case CommandType.ADD_TO_ROOM:
          parsedData = JSON.parse(data);

          if (!parsedData.hasOwnProperty('indexRoom')) {
              throw new Error('roomIndex should be passed with request');
          }

          const roomRequest: RoomRequest = {
              indexRoom: parsedData.indexRoom
          };

          const gameResponse = (new AddUserToRoomCommand()).process(roomRequest, sessionId, ws);

          if (gameResponse.games.length === 0) {
              throw new Error('Games can\'t be created');
          }

          gameResponse.games.forEach(game => {
              const player = game.player;
              game.player.ws.send(JSON.stringify({
                  type: CommandType.CREATE_GAME,
                  data:JSON.stringify(
                      {
                          idGame: game.id,
                          idPlayer: player.id
                      }
                  ),
                  id: 0,
              }));
          });

        return;
  }
};