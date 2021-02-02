'use strict'
const LoginRouter = require('../../../src/presentation/routers/login-router')
const MissingParamError = require('../../../src/presentation/helpers/missing-param-error')

describe('Login Router', () => {
  describe('Client side Login Router', () => {
    test('Should return status 400 if no email is provided', () => {
      const sut = new LoginRouter()
      const httpRequest = {
        body: {
          password: 'any_password'
        }
      }
      const httpResponse = sut.route(httpRequest)

      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return status 400 if no password is provided', () => {
      const sut = new LoginRouter()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com'
        }
      }
      const httpResponse = sut.route(httpRequest)

      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })
  })

  describe('Login Router Server Error', () => {
    test('Should return status 500 if no httpRequest is provided', () => {
      const sut = new LoginRouter()
      const httpResponse = sut.route()
      expect(httpResponse.statusCode).toBe(500)
    })

    test('Should return status 500 if no httpRequest has no body', () => {
      const sut = new LoginRouter()
      const httpRequest = {}
      const httpResponse = sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
    })
  })
})
