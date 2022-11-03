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

  if (usernames.includes(username) || password.length < 3 || username.length < 3) {
    response.status(400).end()
  } else {

    const saltRounds = 10
    await bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) return logger.error(err)
      logger.info(hash)
      const user = new User ({
        username: username,
        password: hash,
        name: name
      })

      const savedUser = await user.save()
      response.status(201).json(savedUser)
    })
  }

  usersRouter.put('/:id', async (request, response) => {
    logger.info('i got here', request)
    const body = request.body
    const id = request.params.id

    logger.info(id)
    const user = await User.find(id)
    user.password = body.password

    const updateUser = await Blog.findByIdAndUpdate(id, user, { new: true  })
    response.json(updateUser)
  })


})

module.exports = usersRouter