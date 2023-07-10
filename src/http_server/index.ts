import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import {process} from "../commands";

const wsc = new WebSocketServer({ port: 3000 });

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

wsc.on('connection', function connection(wss, req) {
    wss.on('error', function (error) {
        console.error(error);
    });

    wss.on('message', function message(data) {
        try {
            const requestData = JSON.parse(data.toString());

            console.log('Request: ', data.toString());

            const response = process(
                requestData.type,
                req.headers['sec-websocket-key']!,
                requestData.data,
                wss
            );

            if (response !== undefined && typeof response === 'object') {
                const jsonResponse = JSON.stringify(response);

                console.log('Response: ', jsonResponse);

                wss.send(jsonResponse);
            }
        } catch (error) {

        }
    });
});