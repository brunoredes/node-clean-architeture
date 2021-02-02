'use strict'
const LoginRouter = require('../../../src/presentation/routers/login-router')
const MissingParamError = require('../../../src/presentation/helpers/missing-param-error')

const makeSut = () => {
  return new LoginRouter()
}

describe('Login Router', () => {
  describe('Client side Login Router', () => {
    test('Should return status 400 if no email is provided', () => {
      const sut = makeSut()
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
      const sut = makeSut()
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
      const sut = makeSut()
      const httpResponse = sut.route()
      expect(httpResponse.statusCode).toBe(500)
    })

    test('Should return status 500 if no httpRequest has no body', () => {
      const sut = makeSut()
      const httpRequest = {}
      const httpResponse = sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
    })
  })

  // describe('Login Router Integration UseCase', () => {
  //   test('should call AuthUseCase with correct params', () => {
  //     const sut = makeSut()
  //   });
  // });
})
