import { request } from "./https";
import {Files} from "../types/files";
import {info} from "@actions/core";

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

export function getUrls(
    projectReference: string,
    releaseReference: string,
    files: Files,
    sessionReference: string
): void {

    for (let file of files.toUpload) {
        info(file)
    }

}