const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })

  user === null
    ? false
    : await bcrypt.compare(password, user.password, (err, res) => {
      if (err) {
        return response.status(401).json({
          error: 'invalid username or password'
        })
      } else {
        const userForToken = {
          username: username,
          id: user._id
        }

        const token = jwt.sign(userForToken, process.env.SECRET)

        response.status(200).send({ token, username: user.username, name: user.name })

      }
    })
})


module.exports = loginRouter