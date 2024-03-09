import * as core from '@actions/core'
import { getInputs } from "./helpers/input";
import { getFiles } from "./helpers/files";

export async function run(): Promise<void> {
  const inputs = getInputs();

  const files = await getFiles(inputs.searchPath)

  if (files.toUpload.length === 0) {

    core.setFailed(`No files were found with the provided path: ${inputs.searchPath}. No release will be uploaded.`);
    return;
  }

  core.info(`With the provided path, there will be ${files.toUpload.length} file(s) uploaded.`);

  core.setOutput('release-reference', 'something here.')
}
