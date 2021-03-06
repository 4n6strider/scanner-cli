'use strict'

const path = require('path')
const _ = require('lodash')
const ModuleResults = require('../../results')
const exec = require('../../exec')

const key = __dirname.split(path.sep).pop()

module.exports = {
  key,
  description: 'Checks node projects for dependencies with known vulnerabilities',
  enabled: true,
  handles: async fm => fm.exists('package.json') && fm.exists('package-lock.json'),
  run: async fm => {
    const { stdout = '{}' } = await exec.command('npm audit --json', { cwd: fm.target })
    const report = JSON.parse(stdout || '{}')
    const advisories = _.get(report, 'advisories', {})
    return Object.keys(advisories)
      .map(prop => advisories[prop])
      .map(adv => ({
        offender: adv.module_name,
        code: `${adv.module_name}-${adv.id}`,
        description: adv.title,
        mitigation: `Ingested via ${_.uniq(_.flatMap(_.get(adv, 'findings', []).map(f => _.get(f, 'paths', ''))).map(f => f.split('>')[0])).join(', ')}`,
        level: mapSeverity(adv.severity)
      }))
      .reduce((results, res) => results[res.level](res), new ModuleResults(key))
  }
}

const mapSeverity = severity => {
  switch (severity) {
    case 'critical': return 'critical'
    case 'high': return 'high'
    case 'moderate': return 'medium'
    default:
      return 'low'
  }
}
