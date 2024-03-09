import { info, setFailed, setOutput}  from "@actions/core";
import { getInputs } from "./helpers/input.js";
import { getFiles } from "./helpers/files.js";
import {getRelease, getSession, getUrls} from "./helpers/service.js";

export async function run(): Promise<void> {
  const inputs = getInputs();

  const files = await getFiles(inputs.searchPath);

  if (files.toUpload.length === 0) {

    setFailed(`No files were found with the provided path: ${inputs.searchPath}. No release will be uploaded.`);
    return;
  }

  const session = await getSession(inputs.sessionReference);
  const release = await getRelease(inputs.projectReference, session);
  await getUrls(inputs.projectReference, release, files, session);

  // Upload Release

  info(`With the provided session reference, we will use ${session} to upload the release.`);
  info(`With the provided session reference, we will upload to ${release} release.`);
  info(`With the provided path, there will be ${files.toUpload.length} file(s) uploaded.`);
  setOutput('release-reference', 'something here.')
}
