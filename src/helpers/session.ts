import * as https from "https";

export async function getSession(
    sessionReference: string
): Promise<string | null> {

    return new Promise<string | null>((resolve, _) => {
        const body = {
            token: sessionReference
        };

        const request = https.request('https://service.servemy.site/api/sessions', {
            method: 'POST'
        }, (response) => {
            let data = '';

            response.on('data', function (d) {
                data += d;
            });

            response.on('end', function () {
                if (response.statusCode === 201) {
                    resolve(null);
                } else {
                    resolve(data);
                }
            });
        });

        request.end(JSON.stringify(body));
    });
}