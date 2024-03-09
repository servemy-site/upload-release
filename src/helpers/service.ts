import {request, upload} from "./https";
import {Files} from "../types/files";
import {readFile, createReadStream} from 'fs'

export async function createSession(
    sessionReference: string
): Promise<string> {
    return request('/api/sessions', 'POST', {
        token: sessionReference
    }, {});
}

export async function createRelease(
    projectReference: string,
    sessionReference: string
): Promise<string> {
    return request(`/api/projects/${projectReference}/releases`, 'POST', {}, {
        'X-SMS-SessionToken': sessionReference
    });
}

export async function uploadFiles(
    projectReference: string,
    releaseReference: string,
    files: Files,
    sessionReference: string
): Promise<void> {

    for (let file of files.toUpload) {
        const result = await request<string>(`/api/projects/${projectReference}/releases/${releaseReference}/files`, 'POST', {
            path: file.destinationPath
        }, {
            'X-SMS-SessionToken': sessionReference
        });

        const content = createReadStream(file.sourcePath);
        await upload(result, content);
    }
}