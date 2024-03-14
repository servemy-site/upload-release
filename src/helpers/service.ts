import {request, upload} from "./https";
import {Files} from "../types/files";
import {createReadStream} from 'fs'
import {info} from "@actions/core";
import mime from 'mime';

declare function require(name:string): any;

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

export async function activateRelease(
    projectReference: string,
    releaseReference: string,
    sessionReference: string
): Promise<string> {
    return request(`/api/projects/${projectReference}/releases/${releaseReference}/active`, 'PATCH', {}, {
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
        const type = mime.getType(file.sourcePath);

        const result = await request<string>(`/api/projects/${projectReference}/releases/${releaseReference}/files`, 'POST', {
            path: file.destinationPath,
            contentType: type
        }, {
            'X-SMS-SessionToken': sessionReference
        });

        const content = createReadStream(file.sourcePath);
        await upload(result, content, type);
    }
}