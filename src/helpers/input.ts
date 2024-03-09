import * as core from '@actions/core'
import {UploadInputNames, UploadInputs} from "../types/inputs";

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): UploadInputs {
    const sessionReference = core.getInput(UploadInputNames.SessionReference, { required: true })
    const projectReference = core.getInput(UploadInputNames.ProjectReference, { required: true })
    const path = core.getInput(UploadInputNames.Path, { required: true })

    const inputs = {
        sessionReference: sessionReference,
        projectReference: projectReference,
        searchPath: path
    } as UploadInputs

    return inputs
}