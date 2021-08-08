import * as core from '@actions/core'
import {getLogger} from '../utils/logger'
import {IntegrationInputs} from '../utils/types'
import {validateInputs, processEnvironmentTpe} from '../utils/validator'

const defaultEnv = 'Unknown'

export function getInputs(): IntegrationInputs {
  const logger = getLogger()

  const jiraInstance: string = core.getInput('jira_instance')
  logger.info(`Connecting to Jira Instance "${jiraInstance}"...`)

  const clientId: string = core.getInput('client_id')
  const clientSecret: string = core.getInput('client_secret')
  logger.info(`Connecting via "${clientId}"`)

  let event: 'build' | 'deployment' =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    core.getInput('event_type') as any

  const environment = getEnvironment()

  // If we have env then it probably is a deployment rather than a build
  if (environment.displayName !== defaultEnv) {
    event = event || 'deployment'
  } else {
    event = event || 'build'
  }

  const inputs = {
    jiraInstance,
    clientId,
    clientSecret,
    event,
  }

  validateInputs(inputs)
  return inputs
}

export function getEnvironment(): {
  displayName: string
  type: 'unmapped' | 'development' | 'testing' | 'staging' | 'production'
} {
  const label = core.getInput('environment') || defaultEnv
  const type = core.getInput('environment_type')

  const slug = label.toLowerCase()

  return {
    displayName: label,
    type: processEnvironmentTpe(slug, type),
  }
}
