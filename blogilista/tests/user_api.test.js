const bcrypt = require('bcryptjs')
const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const { response } = require('../app')
const api = supertest(app)

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User(helper.initialUsers[0])
    user.password = await bcrypt.hash('salasana', 10)
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.getUsers()

    const newUser = helper.userToBeAdded

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with a username already used', async () => {
    const usersAtStart = await helper.getUsers()
    const newUser = helper.initialUsers[0]

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('user list can be accessed', async () => {
    const users = await helper.getUsers()
    expect(users).not.toHaveLength(0)
  })
})

describe('create user', () => {
  test('fails with too short a password', async () => {
    const user = helper.userWithShortPassword
    await api
      .post('/api/users')
      .send(user)
      .expect(400)
  })

  test('fails with too short a username', async () => {
    const user = helper.userWithShortUsername
    await api
      .post('/api/users')
      .send(user)
      .expect(400)
  })
})