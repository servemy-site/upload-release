import * as https from "https";
import {warning} from "@actions/core";

export async function request<T>(
    api: string,
    method: string,
    content: any
): Promise<T> {

    return new Promise<T>((resolve, reject) => {
        const body = JSON.stringify(content);

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        };

        const url = `https://service.servemy.site/${api}`;

        warning(`Starting request to: [${method}] ${url}`);

        const request = https.request(url, options, (response) => {

            let data = '';

            response.on('data', function (d) {
                data += d;
            });

            response.on('end', function () {

                warning(`Finished request to: [${method}] ${url} - ${response.statusCode} - ${data}`);

                if (response.statusCode == undefined || response.statusCode < 200 || response.statusCode >= 300) {
                    reject(data);
                } else {
                    resolve(JSON.parse(data));
                }
            });
        });

        request.end(body);
    });
}