import {AuthenticationCommand, AuthenticationRequest} from "./Command/Authenticate";
import {CreateRoomCommand} from "./Command/create_room";
import {AddUserToRoomCommand, RoomRequest} from "./Command/add_user_to_room";

export enum CommandType {
    REGISTRATION = 'reg',
    SINGLE_PLAY = 'single_play',
    CREATE_ROOM = 'create_room',
    UPDATE_ROOM = 'update_room',
    ADD_TO_ROOM = 'add_user_to_room'
}

export const process = (type: CommandType, sessionId: string, data: string) => {
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
          return (new AuthenticationCommand()).process(authenticationRequest, sessionId);
      case CommandType.CREATE_ROOM:
          return (new CreateRoomCommand()).process(undefined, sessionId);
      case CommandType.ADD_TO_ROOM:
          parsedData = JSON.parse(data);

          if (!parsedData.hasOwnProperty('indexRoom')) {
              throw new Error('roomIndex should be passed with request');
          }

          const roomRequest: RoomRequest = {
              indexRoom: parsedData.indexRoom
          };
          return (new AddUserToRoomCommand()).process(roomRequest, sessionId)
  }
};