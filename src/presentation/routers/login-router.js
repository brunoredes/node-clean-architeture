'use strict'
const HttpResponse = require('../helpers/http-response')
module.exports = class LoginRouter {
  constructor (authUseCaseInstance) {
    this.authUseCase = authUseCaseInstance
  }

  async route (httpRequest) {
    try {
      const { email, password } = httpRequest.body
      if (!email) {
        return HttpResponse.badRequest('email')
      }
      if (!password) {
        return HttpResponse.badRequest('password')
      }

      const accessToken = await this.authUseCase.auth(email, password)
      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }
      return HttpResponse.ok({ accessToken })
    } catch (err) {
      // console.error(err)
      return HttpResponse.serverError()
    }
  }
}
