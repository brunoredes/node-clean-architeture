'use strict'
module.exports = class InvalidParamError extends Error {
  constructor (paramName) {
    super(`Missing param: ${paramName}`)
    this.name = 'InvalidParamError'
  }
}
