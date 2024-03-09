import { setFailed } from '@actions/core'
import { run } from './run.js'

run().catch(error => {
  setFailed((error as Error).message)
})
