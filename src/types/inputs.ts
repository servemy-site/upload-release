export enum UploadInputNames {
    SessionReference = 'session-reference',
    ProjectReference = 'project-reference',
    Path = 'path'
}

export interface UploadInputs {
    /**
     * The identifier used to obtain a session to your project.
     */
    sessionReference: string

    /**
     * The unique identifier for the project where you would like this release uploaded.
     */
    projectReference: string

    /**
     * The search path used to describe what to upload as part of the artifact
     */
    searchPath: string
}