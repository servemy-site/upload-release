import { request } from "./https.js";
import {Files} from "../types/files.js";
import {info} from "@actions/core";
import {getUploadZipSpecification} from "./files.js";

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

    const spec = await getUploadZipSpecification(files.toUpload, files.rootDirectory);

    for (let file of spec) {
        info(file.sourcePath ?? '')
        info(file.mimeType ?? '')
        info(file.destinationPath)


    }

}