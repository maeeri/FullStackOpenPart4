const express = require('express')
const testingRouter = express.Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const helper = require('../tests/test_helper')
const bcrypt = require('bcryptjs')

const logger = require('../utils/logger')
const { response } = require('../app')

testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const user = await User.create(new User({ username: 'taotao', name: 'Tao Tao', password: await bcrypt.hash('password', 10) }))
  const blogs = await Blog.insertMany(helper.blogs)
  blogs.map(async (blog) => {
    blog.user = user._id
    user.blogs = user.blogs.concat(blog._id)
    await blog.save()
  })
  await user.save()
  response.status(204).end()
})

module.exports = testingRouter