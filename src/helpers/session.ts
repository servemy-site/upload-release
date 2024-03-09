import * as https from "https";

export async function getSession(
    sessionReference: string
): Promise<string | null> {

    return new Promise<string | null>((resolve, _) => {
        const body = JSON.stringify({
            token: sessionReference
        });

        const request = https.request('https://service.servemy.site/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }, (response) => {
            let data = '';

            response.on('data', function (d) {
                data += d;
            });

            response.on('end', function () {
                resolve(data);
            });
        });

        request.end(body);
    });
}