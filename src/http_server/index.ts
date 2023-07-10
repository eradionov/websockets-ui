import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import {process} from "../commands";

const ws = new WebSocketServer({ port: 3000 });

export const httpServer = http.createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
    fs.readFile(file_path, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });


});

ws.on('connection', function connection(ws, req) {
    ws.on('error', function (error) {
        console.error(error);
    });

    ws.on('message', function message(data) {
        const requestData = JSON.parse(data.toString());
        console.log('Request: ', data.toString());
        const response = process(
            requestData.type,
            req.headers['sec-websocket-key']!,
            requestData.data
        );

        if (response !== undefined && typeof response === 'object') {
            const jsonResponse = JSON.stringify(response);

            console.log('Response: ', jsonResponse);

            ws.send(jsonResponse);
        }
    });
});