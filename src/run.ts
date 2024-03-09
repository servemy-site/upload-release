import * as core from '@actions/core'

export async function run(): Promise<void> {
  const text: string = core.getInput('text')

  core.info(`Received: ${text}`)
  core.setOutput('text', text)
}
