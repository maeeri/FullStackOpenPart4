const express = require('express')
const blogsRouter = express.Router()
const Blog = require('../models/blog')

const logger = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  logger.info('this is the initial: ', blog.likes)
  if (blog.likes === undefined) {
    blog.likes = 0
    logger.info('this is the defaulted: ', blog.likes)
  }

  if (blog.title === undefined || blog.url === undefined) {
    response.status(400).end()
  }

  await blog.save()
  response.status(201).json(blog)
})

module.exports = blogsRouter