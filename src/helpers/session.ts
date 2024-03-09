import { request } from "./https";

export async function getSession(
    sessionReference: string
): Promise<string | null> {
    return request('/api/sessions', 'POST', {
        token: sessionReference
    });
}