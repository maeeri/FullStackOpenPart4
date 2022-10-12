const express = require('express')
const { response } = require('../app')
const blogsRouter = express.Router()
const Blog = require('../models/blog')
const { getBlogs } = require('../tests/test_helper')

const logger = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  if (blog.likes === undefined) {
    blog.likes = 0
  }

  if (blog.title === undefined || blog.url === undefined) {
    response.status(400).end()
  }

  await blog.save()
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

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes
  }

  if ((await Blog.findById(request.params.id)) !== null) {
    const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true  })
    response.json(updateBlog)
  } else {
    response.status(404).end()
  }

})

blogsRouter.delete('/:id', async (request, response) => {
  if (await Blog.findById(request.params.id)) {
    await Blog.findByIdAndRemove(request.params.id)
    await response.status(204).end()
  } else {
    await response.status(404).end()
  }
})

module.exports = blogsRouter