import * as https from "https";
import {debug, error, info, warning} from "@actions/core";
import {RequestOptions} from "https";
import {OutgoingHttpHeaders} from "http";
import {ReadStream} from "fs";

export async function request<T>(
    api: string,
    method: string,
    content: any,
    headers: OutgoingHttpHeaders
): Promise<T> {

    return new Promise<T>((resolve, reject) => {
        const body = JSON.stringify(content);

        headers["Content-Type"] = 'application/json';
        headers["Content-Length"] = body.length;

        const options: RequestOptions = {
            hostname: 'service.servemy.site',
            port: 443,
            path: api,
            method: method,
            headers: headers
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

                let result: T;

                try {
                    result = JSON.parse(data) as T;
                } catch(e) {
                    result = data as T;
                }

                if (failed) reject(result);
                else resolve(result);
            });
        });

        request.end(body);
    });
}

export async function upload(
    url: string,
    data: ReadStream
): Promise<void> {

    return new Promise<void>(async (resolve, reject) => {
        const options: RequestOptions = {
            method: 'PUT',
            headers: {
                "x-amz-server-side-encryption": "AES256"
            }
        };

        info(`Starting upload to: [PUT] ${url}`);

        const request = https.request(url, options, (response) => {

            let data = '';

            response.on('data', function (d) {
                data += d;
            });

            response.on('end', function () {
                info(`Finished request to: [PUT] ${url}} - ${response.statusCode}`);
                info(`Parsed request to: [PUT] ${url} - ${data}`);

                const failed = response.statusCode == undefined || response.statusCode < 200 || response.statusCode >= 300;

                if (failed) reject();
                else resolve();
            });
        });

        for await (const chunk of data){
            request.write(chunk)
        }

        request.removeHeader('Transfer-Encoding');
        request.end();
    });
}