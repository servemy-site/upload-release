import { info, setFailed, setOutput}  from "@actions/core";
import { getInputs } from "./helpers/input";
import { getFiles } from "./helpers/files";
import {activateRelease, createRelease, createSession, uploadFiles} from "./helpers/service";

export async function run(): Promise<void> {
  const inputs = getInputs();

  const files = await getFiles(inputs.searchPath);

  if (files.toUpload.length === 0) {

    setFailed(`No files were found with the provided path: ${inputs.searchPath}. No release will be uploaded.`);
    return;
  }

  const session = await createSession(inputs.sessionReference);
  const release = await createRelease(inputs.projectReference, session);
  await uploadFiles(inputs.projectReference, release, files, session);

  if (inputs.activate) {
    await activateRelease(inputs.projectReference, release, session);
  }

  info(`With the provided session reference, we will use ${session} to upload the release.`);
  info(`With the provided session reference, we will upload to ${release} release.`);
  info(`With the provided path, there will be ${files.toUpload.length} file(s) uploaded.`);
  setOutput('release-reference', release)
}
