import {CreateRoomCommand} from "./Command/create_room";
import {AddUserToRoomCommand, RoomRequest} from "./Command/add_user_to_room";
import {WebSocket, WebSocketServer} from "ws";
import {AddShipsCommand, ShipsRequest} from "./Command/add_ships";
import {AttackCommand, IAttack} from "./Command/attack";
import {AuthenticationCommand, AuthenticationRequest} from "./Command/authenticate";

export enum CommandType {
    REGISTRATION = 'reg',
    SINGLE_PLAY = 'single_play',
    CREATE_ROOM = 'create_room',
    UPDATE_ROOM = 'update_room',
    ADD_TO_ROOM = 'add_user_to_room',
    CREATE_GAME = 'create_game',
    ADD_SHIPS = 'add_ships',
    START_GAME = 'start_game',
    ATTACK = 'attack',
    TURN = 'turn',
    FINISH = 'finish',
    UPDATE_WINNERS = 'update_winners',

}

export const process = (type: CommandType, sessionId: string, data: string, ws: WebSocket, wss: WebSocketServer) => {
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
          (new AuthenticationCommand(ws, wss)).process(authenticationRequest, sessionId);
          break;
      case CommandType.CREATE_ROOM:
          (new CreateRoomCommand(ws, wss)).process(undefined, sessionId);

         break;
      case CommandType.ADD_SHIPS:
          const shipsRequest: ShipsRequest = JSON.parse(data);
          (new AddShipsCommand(ws, wss)).process(shipsRequest, sessionId);
          break;
    case CommandType.ATTACK:
        const attackRequest = JSON.parse(data) as IAttack;
        (new AttackCommand(ws, wss)).process(attackRequest, sessionId);
        break;
      case CommandType.ADD_TO_ROOM:
          parsedData = JSON.parse(data);

          if (!parsedData.hasOwnProperty('indexRoom')) {
              throw new Error('roomIndex should be passed with request');
          }

          const roomRequest: RoomRequest = {
              indexRoom: parsedData.indexRoom
          };

          (new AddUserToRoomCommand(ws, wss)).process(roomRequest, sessionId);

        break;
  }
};