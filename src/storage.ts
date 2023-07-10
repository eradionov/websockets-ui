import {createHash} from "crypto";

// enum ShipType {
//     SMALL = 'small',
//     MEDIUM = 'medium',
//     LARGE = 'large',
//     HUGE = 'huge'
// }

export interface User {
    name: string;
    password: string;
    sessionId: string;
}

interface Result {
    index: number;
    user: User;
}

export interface Room {
    indexRoom: number;
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

// interface Game {
//     id: number;
//     user: User;
//     wins: number;
//     ships: Ship[];
// }
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
export const getOrCreateUser = (username: string, password: string, uniqueSessionId: string) => {
    const hash = getHashedPassword(password);
    const existingUserIndex = users.findIndex(user => user.name === username && user.password === hash);

    if (existingUserIndex === -1) {
        const usersIndex = users.length;
        const user = {name: username, sessionId: uniqueSessionId, password: hash} as User;

        users.push(user);

        return {index: usersIndex, user} as Result;
    }

    return {index: existingUserIndex, user: users[existingUserIndex]};
}

const getHashedPassword = (password: string) => createHash('sha256').update(password).digest('hex');

export const getUserBySessionId = (sessionId: string) => users.find(user => user.sessionId === sessionId);

export const createRoomWithUser = (user: User) => {
    rooms.push({indexRoom: rooms.length, roomUsers: [user]});
};

export const getRooms = () => rooms.filter(room => room.roomUsers.length < MAX_ROOM_USERS);

export const addUserToRoom = (roomIndex: number, sessionId: string) => {
    const requestedRoomIndex = rooms.findIndex(room => room.indexRoom === roomIndex);
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

    rooms[roomIndex]!.roomUsers.push(user);
};