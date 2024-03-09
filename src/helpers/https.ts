import * as https from "https";
import {debug, error, info, warning} from "@actions/core";

export async function request<T>(
    api: string,
    method: string,
    content: any
): Promise<T> {

    return new Promise<T>((resolve, reject) => {
        const body = JSON.stringify(content);

        const options = {
            hostname: 'service.servemy.site',
            port: 443,
            path: api,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        };

        info(`Starting request to: [${method}] https://${options.hostname}${options.path}`);

        const request = https.request(options, (response) => {

            let data = '';

            response.on('data', function (d) {
                data += d;
            });

            response.on('end', function () {
                info(`Finished request to: [${method}] https://${options.hostname}${options.path} - ${response.statusCode}`);
                debug(`Parsed request to: [${method}] https://${options.hostname}${options.path} - ${data}`);

                const failed = response.statusCode == undefined || response.statusCode < 200 || response.statusCode >= 300;

                if (failed) reject(JSON.parse(data));
                else resolve(JSON.parse(data));
            });
        });

        request.end(body);
    });
}