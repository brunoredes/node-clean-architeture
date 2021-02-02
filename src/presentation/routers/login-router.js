'use strict'
const HttpResponse = require('../helpers/http-response')
module.exports = class LoginRouter {
  constructor (authUseCaseInstance) {
    this.authUseCase = authUseCaseInstance
  }

  route (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return HttpResponse.serverError()
    }

    const { email, password } = httpRequest.body
    if (!email) {
      return HttpResponse.badRequest('email')
    }
    if (!password) {
      return HttpResponse.badRequest('password')
    }

    this.authUseCase.auth(email, password)
  }
}
