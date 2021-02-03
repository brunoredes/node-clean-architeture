'use strict'
const LoginRouter = require('../../../src/presentation/routers/login-router')
const MissingParamError = require('../../../src/presentation/helpers/missing-param-error')
const UnauthorizedError = require('../../../src/presentation/helpers/unauthorized-error')

const makeSut = () => {
  class AuthUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'valid_token'
  const sut = new LoginRouter(authUseCaseSpy)
  return {
    sut,
    authUseCaseSpy
  }
}

describe('Login Router', () => {
  describe('Client side Login Router', () => {
    test('Should return status code 400 if no email is provided', () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          password: 'any_password'
        }
      }
      const httpResponse = sut.route(httpRequest)

      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return status code 400 if no password is provided', () => {
      const { sut } = makeSut()
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
    test('Should return status code 500 if no httpRequest is provided', () => {
      const { sut } = makeSut()
      const httpResponse = sut.route()
      expect(httpResponse.statusCode).toBe(500)
    })

    test('Should return status code 500 if no httpRequest has no body', () => {
      const { sut } = makeSut()
      const httpRequest = {}
      const httpResponse = sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
    })
  })

  describe('Login Router Integration UseCase', () => {
    test('Should call AuthUseCase with correct params', () => {
      const { sut, authUseCaseSpy } = makeSut()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      sut.route(httpRequest)
      expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
      expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
    })

    test('Should return status code 401 when invalid credentials are provided', () => {
      const { sut, authUseCaseSpy } = makeSut()
      authUseCaseSpy.accessToken = null
      const httpRequest = {
        body: {
          email: 'invalid_email@mail.com',
          password: 'invalid_password'
        }
      }
      const httpResponse = sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(401)
      expect(httpResponse.body).toEqual(new UnauthorizedError())
    })

    test('Should return status code 200 when valid credentials are provided', () => {
      const { sut, authUseCaseSpy } = makeSut()
      const httpRequest = {
        body: {
          email: 'valid_email@mail.com',
          password: 'valid_password'
        }
      }
      const httpResponse = sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(200)
      expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
    })

    test('Should return status code 500 if no AuthUseCase is provided', () => {
      const sut = new LoginRouter()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
    })

    test('Should return status code 500 if AuthUseCase has no auth method', () => {
      const sut = new LoginRouter({})
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
    })
  })
})