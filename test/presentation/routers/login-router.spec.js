'use strict'
const LoginRouter = require('../../../src/presentation/routers/login-router')
const MissingParamError = require('../../../src/presentation/helpers/missing-param-error')
const UnauthorizedError = require('../../../src/presentation/helpers/unauthorized-error')
const InvalidParamError = require('../../../src/presentation/helpers/invalid-param-error')
const ServerError = require('../../../src/presentation/helpers/server-error')

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCaseSpy()
  const emailValidatorSpy = makeEmailValidator()
  const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid () {
      throw new Error()
    }
  }
  return new EmailValidatorSpy()
}

const makeAuthUseCaseSpy = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'validToken'
  return authUseCaseSpy
}

const makeAuthUseCaseSpyWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error()
    }
  }

  return new AuthUseCaseSpy()
}

describe('Login Router', () => {
  describe('Client side Login Router', () => {
    test('Should return status code 400 if no email is provided', async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)

      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return status code 400 if no password is provided', async () => {
      const { sut } = makeSut()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com'
        }
      }
      const httpResponse = await sut.route(httpRequest)

      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })
  })

  describe('Login Router Server Error', () => {
    describe('HttpRequest is not provided', () => {
      test('Should return status code 500 if no httpRequest is provided', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.route()
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
      })
    })
    describe('HttpRequest has no body', () => {
      test('Should return status code 500 if no httpRequest has no body', async () => {
        const { sut } = makeSut()
        const httpRequest = {}
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
      })
    })
  })

  describe('Login Router Integration UseCase', () => {
    test('Should call AuthUseCase with correct params', async () => {
      const { sut, authUseCaseSpy } = makeSut()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      await sut.route(httpRequest)
      expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
      expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
    })

    test('Should return status code 500 if no AuthUseCase is provided', async () => {
      const sut = new LoginRouter()
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should return status code 500 if AuthUseCase has no auth method', async () => {
      const sut = new LoginRouter({})
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })
  })

  describe('Login Router Integration Throw', () => {
    describe('AuthUseCase Throw', () => {
      test('Should return status code 500 if AuthUseCase throws', async () => {
        const authUseCaseSpy = makeAuthUseCaseSpyWithError()
        const sut = new LoginRouter(authUseCaseSpy)
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
          }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
      })
    })
    describe('EmailValidator throws', () => {
      test('Should return status code 500 if EmailValidator throws', async () => {
        const authUseCaseSpy = makeAuthUseCaseSpy()
        const emailValidatorSpy = makeEmailValidatorWithError()
        const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
          }
        }
        const httpResponse = await sut.route(httpRequest)
        expect(httpResponse.statusCode).toBe(500)
      })
    })
  })

  describe('Login-router validator and Invalid credentials', () => {
    test('Should return status code 401 when invalid credentials are provided', async () => {
      const { sut, authUseCaseSpy } = makeSut()
      authUseCaseSpy.accessToken = null
      const httpRequest = {
        body: {
          email: 'invalid_email@mail.com',
          password: 'invalid_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(401)
      expect(httpResponse.body).toEqual(new UnauthorizedError())
    })

    test('Should return status code 200 when valid credentials are provided', async () => {
      const { sut, authUseCaseSpy } = makeSut()
      const httpRequest = {
        body: {
          email: 'valid_email@mail.com',
          password: 'valid_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(200)
      expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
    })

    test('Should return status code 400 if an invalid email is provided', async () => {
      const { sut, emailValidatorSpy } = makeSut()
      emailValidatorSpy.isEmailValid = false
      const httpRequest = {
        body: {
          email: 'invalid_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(400)
      expect(httpResponse.body).toEqual(new InvalidParamError('email'))
    })

    test('Should return status code 500 if no EmailValidator is provided', async () => {
      const authUseCaseSpy = makeAuthUseCaseSpy()
      const sut = new LoginRouter(authUseCaseSpy)
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should return status code 500 if no EmailValidator has no isValid method', async () => {
      const authUseCaseSpy = makeAuthUseCaseSpy()
      const sut = new LoginRouter(authUseCaseSpy, {})
      const httpRequest = {
        body: {
          email: 'any_email@mail.com',
          password: 'any_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    })

    describe('Email validator with correct params', () => {
      test('Should call EmailValidator with correct params', async () => {
        const { sut, emailValidatorSpy } = makeSut()
        const httpRequest = {
          body: {
            email: 'any_email@mail.com',
            password: 'any_password'
          }
        }
        await sut.route(httpRequest)
        expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
      })
    })
  })
})
