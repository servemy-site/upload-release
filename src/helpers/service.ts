import { request } from "./https";
import {Files} from "../types/files";
import {info} from "@actions/core";
import {getUploadZipSpecification} from "./files";

export async function getSession(
    sessionReference: string
): Promise<string> {
    return request('/api/sessions', 'POST', {
        token: sessionReference
    }, {});
}

export async function getRelease(
    projectReference: string,
    sessionReference: string
): Promise<string> {
    return request(`/api/projects/${projectReference}/releases`, 'POST', {}, {
        'X-SMS-SessionToken': sessionReference
    });
}

export async function getUrls(
    projectReference: string,
    releaseReference: string,
    files: Files,
    sessionReference: string
): Promise<void> {

    const spec = getUploadZipSpecification(files.toUpload, files.rootDirectory);

    for (let file of spec) {
        info(file.sourcePath ?? '')
        info(file.destinationPath)

        const result = await request<string>(`/api/projects/${projectReference}/releases/${releaseReference}/files`, 'POST', {
            path: file.destinationPath
        }, {
            'X-SMS-SessionToken': sessionReference
        });

        info(result)
    }

}