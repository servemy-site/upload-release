import { setFailed } from '@actions/core'
import { run } from './run'

run().catch(error => {
  setFailed((error as Error).message)
})
