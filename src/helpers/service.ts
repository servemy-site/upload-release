import { request } from "./https";

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