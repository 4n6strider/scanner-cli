'use strict'

/* eslint-disable no-unused-expressions */

const path = require('path')
const { handles, run } = require('..')
const FileManager = require('../../../fileManager')

describe('node crossenv Module', () => {
  const target = path.join(__dirname, './sample')
  let fm, results, opts

  beforeEach(() => {
    results = {
      critical: sinon.stub()
    }
    const logger = {
      log: sinon.stub(),
      debug: sinon.stub(),
      error: sinon.stub()
    }
    fm = new FileManager({ target, logger })
    opts = { fm, results }
  })

  it('should handle node projects', () => {
    expect(handles(opts)).to.be.true
  })

  it('should inspect package.json', async () => {
    await run(opts)
    expect(results.critical).to.have.callCount(3)
    expect(results.critical.firstCall.args[0]).to.deep.equal({
      'code': 0,
      'description': 'node-crossenv malware found',
      'mitigation': 'http://blog.npmjs.org/post/163723642530/crossenv-malware-on-the-npm-registry',
      'offender': 'crossenv'
    })
  })
})