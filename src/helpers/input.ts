import { getInput } from '@actions/core'
import { UploadInputNames, UploadInputs } from "../types/inputs.js";

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): UploadInputs {
    const sessionReference = getInput(UploadInputNames.SessionReference, { required: true })
    const projectReference = getInput(UploadInputNames.ProjectReference, { required: true })
    const path = getInput(UploadInputNames.Path, { required: true })

    const inputs = {
        sessionReference: sessionReference,
        projectReference: projectReference,
        searchPath: path
    } as UploadInputs

    return inputs
}