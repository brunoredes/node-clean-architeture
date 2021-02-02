'use strict'
module.exports = () => {
  const router = new SignUpRouter()
  router.post('/signup', ExpressRouterAdapter.adapt(router))
}

// const { Router: router } = require('express');
class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }
      const httpResponse = await router.route(httpRequest)
      return res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}
// presentation layer: aqui que é exposto ao mundo
class SignUpRouter {
  async route (httpRequest) {
    const { email, password, repeatPassword } = httpRequest.body
    const user = new SignUpUseCase().signUp(email, password, repeatPassword)
    return {
      statusCode: 201,
      body: user
    }
  }
}
// Domain: onde fica regra de negócio
class SignUpUseCase {
  async signUp (email, password, repeatPassword) {
    if (password === repeatPassword) {
      new AddAccountRepository().add(email, password)
    }
  }
}

// Infra layer: orm, database, etc
const AccountModel = require('mongoose').model('Account')
class AddAccountRepository {
  async add (email, password) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}
