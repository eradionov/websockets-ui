import {createHash} from "crypto";
import {WebSocket} from "ws";

// enum ShipType {
//     SMALL = 'small',
//     MEDIUM = 'medium',
//     LARGE = 'large',
//     HUGE = 'huge'
// }

export interface User {
    id: number
    name: string;
    password: string;
    sessionId: string;
    ws: WebSocket;
}

interface Result {
    index: number;
    user: User;
}

export interface Room {
    roomId: number;
    roomUsers: User[];

}

const rooms: Room[] = [];

//
// interface Room {
//     id: number;
//     users: User[];
//     password: string;
//     wins: number;
// }

export interface Game {
    id: number;
    player: User;
    wins: number;
}

const games: Game[] = [];
//
// interface Ship {
//     position: {
//         x: number;
//         y: number;
//     };
//     length: number;
//     type: ShipType;
//
// }

const users: User[] = [];
const MAX_ROOM_USERS = 2;

// TODO: does not follow SRP principle
export const getOrCreateUser = (username: string, password: string, uniqueSessionId: string, ws: WebSocket) => {
    const hash = getHashedPassword(password);
    const existingUser = users.find(user => user.name === username && user.password === hash);

    if (existingUser === undefined) {
        const user = {id: users.length, name: username, sessionId: uniqueSessionId, password: hash, ws} as User;

        users.push(user);

        return {index: user.id, user} as Result;
    }

    return {index: existingUser.id, user: existingUser};
}

const getHashedPassword = (password: string) => createHash('sha256').update(password).digest('hex');

export const getUserBySessionId = (sessionId: string) => users.find(user => user.sessionId === sessionId);

export const createRoomWithUser = (user: User) => {
    rooms.push({roomId: rooms.length, roomUsers: [user]});
};

export const getRooms = (sessionId: string) => rooms.filter(room => room.roomUsers.length < MAX_ROOM_USERS || room.roomUsers.find(user => user.sessionId === sessionId) === undefined);

export const addUserToRoom = (roomIndex: number, sessionId: string) => {
    const requestedRoomIndex = rooms.findIndex(room => room.roomId === roomIndex);
    const user = users.find(user => user.sessionId === sessionId);

    if (requestedRoomIndex === -1) {
        throw new Error('Room with such index does not exist');
    }

    if (user === undefined) {
        throw new Error('User can\'t be added to specified room');
    }

    if (rooms[roomIndex]!.roomUsers.find(user => user.sessionId === sessionId) !== undefined) {
        throw new Error('User already exists in specified room');
    }

    const targetRoom = rooms[roomIndex];
    targetRoom!.roomUsers.push(user);

    return targetRoom;
};

export const getRoomByIndex = (id: number) => rooms.find(room => room.roomId === id);

export const createGame = (roomId: number, userSessionId: string) => {
    const user = users.find(user => user.sessionId === userSessionId);

    if (user === undefined) {
        throw new Error('User is not found');
    }
    const game = {player: user, id: roomId, wins: 0} as Game;
    games.push(game);

    return game;
};