const express = require('express')
const blogsRouter = express.Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

const logger = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {

  const blog = new Blog(request.body)
  logger.info(blog)

  blog.likes = request.body.likes || 0
  const user = request.user

  blog.user = user

  if (blog.title === undefined || blog.url === undefined) {
    logger.info('i shouldn\'t be here, this is the blogscontroller post method error branch')
    return response.status(400).end()
  }

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  logger.info('i got to the end of post method')
  response.status(201).json(blog)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
  const body = request.body
  const id = request.params.id

  if (!request.token) {
    response.status(401).end()
  } else if (await Blog.findById(id)) {
    const blog = await Blog.findById(id)
    if (request.user.id.toString() === blog.user.toString()) {
      blog.author = body.author
      blog.title = body.title
      blog.url = body.url
      blog.likes = body.likes

      const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true  })
      response.json(updateBlog)
    } else if (blog.likes !== body.likes) {
      blog.likes = body.likes
      const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true  })
      response.json(updateBlog)
    } else {
      response.status(401).end()
    }
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const id = request.params.id

  if (request.token === null) {
    response.status(401).end()
  } else if (await Blog.findById(id)) {
    const blog = await Blog.findById(id)

    request.user.id.toString() === blog.user.toString()
      ? await Blog.findByIdAndRemove(request.params.id)
      : await response.status(401).end()
    await response.status(204).end()
  } else {
    await response.status(404).end()
  }
})

module.exports = blogsRouter