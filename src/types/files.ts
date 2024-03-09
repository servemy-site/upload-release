export interface Files {
    toUpload: File[]
}

export interface File {
    sourcePath: string
    destinationPath: string
}