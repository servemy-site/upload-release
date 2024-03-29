import * as glob from '@actions/glob'
import * as path from 'path'
import {debug, info} from '@actions/core'
import {stat,statSync, existsSync} from 'fs'
import {dirname, normalize, resolve} from 'path'
import {promisify} from 'util'
import {Files, File} from "../types/files";
const stats = promisify(stat)


function getDefaultGlobOptions(): glob.GlobOptions {
    return {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true
    }
}

/**
 * If multiple paths are specific, the least common ancestor (LCA) of the search paths is used as
 * the delimiter to control the directory structure for the artifact. This function returns the LCA
 * when given an array of search paths
 *
 * Example 1: The patterns `/foo/` and `/bar/` returns `/`
 *
 * Example 2: The patterns `~/foo/bar/*` and `~/foo/voo/two/*` and `~/foo/mo/` returns `~/foo`
 */
function getMultiPathLCA(searchPaths: string[]): string {
    if (searchPaths.length < 2) {
        throw new Error('At least two search paths must be provided')
    }

    const commonPaths = new Array<string>()
    const splitPaths = new Array<string[]>()
    let smallestPathLength = Number.MAX_SAFE_INTEGER

    // split each of the search paths using the platform specific separator
    for (const searchPath of searchPaths) {
        debug(`Using search path ${searchPath}`)

        const splitSearchPath = path.normalize(searchPath).split(path.sep)

        // keep track of the smallest path length so that we don't accidentally later go out of bounds
        smallestPathLength = Math.min(smallestPathLength, splitSearchPath.length)
        splitPaths.push(splitSearchPath)
    }

    // on Unix-like file systems, the file separator exists at the beginning of the file path, make sure to preserve it
    if (searchPaths[0].startsWith(path.sep)) {
        commonPaths.push(path.sep)
    }

    let splitIndex = 0
    // function to check if the paths are the same at a specific index
    function isPathTheSame(): boolean {
        const compare = splitPaths[0][splitIndex]
        for (let i = 1; i < splitPaths.length; i++) {
            if (compare !== splitPaths[i][splitIndex]) {
                // a non-common index has been reached
                return false
            }
        }
        return true
    }

    // loop over all the search paths until there is a non-common ancestor or we go out of bounds
    while (splitIndex < smallestPathLength) {
        if (!isPathTheSame()) {
            break
        }
        // if all are the same, add to the end result & increment the index
        commonPaths.push(splitPaths[0][splitIndex])
        splitIndex++
    }
    return path.join(...commonPaths)
}

export async function getFiles(
    searchPath: string
): Promise<Files> {
    const globber = await glob.create(searchPath, getDefaultGlobOptions())

    const rawSearchResults: string[] = await globber.glob()
    const searchResults: string[] = []

    const searchPaths: string[] = globber.getSearchPaths()

    /*
      Files are saved with case insensitivity. Uploading both a.txt and A.txt will files to be overwritten
      Detect any files that could be overwritten for user awareness
    */
    const set = new Set<string>()

    /*
      Directories will be rejected if attempted to be uploaded. This includes just empty
      directories so filter any directories out from the raw search results
    */
    for (const searchResult of rawSearchResults) {
        const fileStats = await stats(searchResult)
        // isDirectory() returns false for symlinks if using fs.lstat(), make sure to use fs.stat() instead
        if (!fileStats.isDirectory()) {
            debug(`File:${searchResult} was found using the provided searchPath`)
            searchResults.push(searchResult)

            // detect any files that would be overwritten because of case insensitivity
            if (set.has(searchResult.toLowerCase())) {
                info(
                    `Uploads are case insensitive: ${searchResult} was detected that it will be overwritten by another file with the same path`
                )
            } else {
                set.add(searchResult.toLowerCase())
            }
        } else {
            debug(
                `Removing ${searchResult} from rawSearchResults because it is a directory`
            )
        }
    }

    let root = '';

    if (searchPaths.length > 1) {
        info(`Multiple search paths detected. Calculating the least common ancestor of all paths`)
        root = getMultiPathLCA(searchPaths)
        info(`The least common ancestor is ${root}. This will be the root directory of the artifact`)
    }
    /*
      Special case for a single file artifact that is uploaded without a directory or wildcard pattern. The directory structure is
      not preserved and the root directory will be the single files parent directory
    */
    else if (searchResults.length === 1 && searchPaths[0] === searchResults[0]) {
        root = dirname(searchResults[0]);
    }
    else {
        root = searchPaths[0];
    }

    // Normalize and resolve, this allows for either absolute or relative paths to be used
    root = normalize(root)
    root = resolve(root)

    const spec: File[] = [];

    for (let file of searchResults) {
        if (!existsSync(file)) {
            throw new Error(`File ${file} does not exist`)
        }
        if (!statSync(file).isDirectory()) {
            // Normalize and resolve, this allows for either absolute or relative paths to be used
            file = normalize(file)
            file = resolve(file)
            if (!file.startsWith(root)) {
                throw new Error(
                    `The rootDirectory: ${root} is not a parent directory of the file: ${file}`
                )
            }

            // Check for forbidden characters in file paths that may cause ambiguous behavior if downloaded on different file systems
            const uploadPath = file.replace(root, '')
            validateFilePath(uploadPath)

            spec.push({
                sourcePath: file,
                destinationPath: uploadPath
            })
        } else {
            // Empty directory
            const directoryPath = file.replace(root, '')
            validateFilePath(directoryPath)

            spec.push({
                sourcePath: file,
                destinationPath: directoryPath
            })
        }
    }

    return {
        toUpload: spec
    }
}


/**
 * Validates file paths to check for any illegal characters that can cause problems on different file systems
 */
export function validateFilePath(path: string): void {
    if (!path) {
        throw new Error(`Provided file path input during validation is empty`)
    }

    for (const [
        invalidCharacterKey,
        errorMessageForCharacter
    ] of invalidArtifactFilePathCharacters) {
        if (path.includes(invalidCharacterKey)) {
            throw new Error(
                `The path for one of the files in artifact is not valid: ${path}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(
                    invalidArtifactFilePathCharacters.values()
                ).toString()}
          
The following characters are not allowed in files that are uploaded due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.
          `
            )
        }
    }
}


const invalidArtifactFilePathCharacters = new Map<string, string>([
    ['"', ' Double quote "'],
    [':', ' Colon :'],
    ['<', ' Less than <'],
    ['>', ' Greater than >'],
    ['|', ' Vertical bar |'],
    ['*', ' Asterisk *'],
    ['?', ' Question mark ?'],
    ['\r', ' Carriage return \\r'],
    ['\n', ' Line feed \\n']
])