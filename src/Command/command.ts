import {IResponse} from "../response";

export interface ICommand {
    process(data: object, sessionId: string): IResponse
}