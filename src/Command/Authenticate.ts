import {getOrCreateUser} from "../storage";
import {CommandType} from "../commands";
import {ICommand} from "./command";
import {IResponse} from "../response";

export interface AuthenticationRequest {
    name: string;
    password: string;
}

interface AuthenticationResponse extends IResponse{
    type: string,
    data: string,
    id: number;
}

export class AuthenticationCommand implements ICommand {
    public process(data: AuthenticationRequest, sessionId: string): AuthenticationResponse {
        try {
            const {name, password}:AuthenticationRequest = data as AuthenticationRequest;
            const result = getOrCreateUser(name, password, sessionId);

            if (result === undefined || result.index === -1) {
                throw new Error('user authentication issue occurred');
            }

            return {
                type: CommandType.REGISTRATION,
                data: JSON.stringify({
                    name: result.user!.name,
                    index: result.index,
                    error: false,
                    errorText: ''
                }),
                id: 0
            } as AuthenticationResponse;
        } catch (error) {
            const {message}: any = error;

            return {
                type: CommandType.REGISTRATION,
                data: JSON.stringify({
                    name: data.name,
                    index: 0,
                    error: true,
                    errorText: message
                })
            } as AuthenticationResponse;
        }
    }
}