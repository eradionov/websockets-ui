import {getOrCreateUser} from "../storage";
import {AbstractCommand} from "./command";
import {registrationMessage} from "../utils";

export interface AuthenticationRequest {
    name: string;
    password: string;
}

export class AuthenticationCommand extends AbstractCommand {
    public process(data: AuthenticationRequest, sessionId: string): undefined {
        try {
            const {name, password}:AuthenticationRequest = data as AuthenticationRequest;
            const result = getOrCreateUser(name, password, sessionId, this.ws);

            if (result === undefined || result.index === -1) {
                throw new Error('user authentication issue occurred');
            }

            this.ws.send(registrationMessage(result.user!.name, result.index, false));
        } catch (error) {
            const {message}: any = error;

            this.ws.send(registrationMessage(data.name, -1, true, message));
        }
    }
}