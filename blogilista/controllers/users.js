const usersRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Blog = require('../models/blog')

const logger = require('../utils/logger')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const usernames = (await User.find({})).map(user => user.username)
  const user = new User({
    username,
    name,
    password
  })

  if (usernames.includes(username) || password.length < 3 || username.length < 3) {
    response.status(400).end()
  } else {

    const saltRounds = 10
    await bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return logger.error(err)

      user.username = username
      user.password = hash
      user.name = name
    })
  }

  const savedUser = await user.save()
  response.status(201).json(savedUser)

})

module.exports = usersRouter