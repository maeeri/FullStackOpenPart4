const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')
const logger = require('../utils/logger')
const { response } = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
})

describe('login', () => {
  test('works', async () => {
    const newUser = helper.userToBeAdded
    console.log(newUser)

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const userCreds = {
      username: newUser.username,
      password: newUser.password
    }

    const us = await User.findOne({ newUser })

    logger.info('here: ', us)

    await api
      .post('/api/login')
      .send(userCreds)
      .expect(200)
  })
})