const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const logger = require('../utils/logger')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.blogs)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.blogs.length)
})

test('id is called id', async () => {
  const response = await api.get('/api/blogs')
  const blog = response.body[0]
  expect(blog.id).toBeDefined()
})

describe('post request tests', () => {
  test('blog post can be added', async () => {
    await api
      .post('/api/blogs')
      .send(helper.blogToBeAdded)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogs = await (await helper.getBlogs()).map(blog => {
      return {
        author: blog.author,
        title: blog.title,
        url: blog.url
      }})
    expect(blogs.length).toBe(helper.blogs.length + 1)
    expect(blogs).toContainEqual(helper.blogToBeAdded)
  })

  test('likes defaulted', async () => {
    await api
      .post('/api/blogs')
      .send(helper.blogToBeAdded)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const lastBlog = await Blog.findOne({ author: 'Maija Mehiläinen' })
    logger.info(lastBlog)
    expect(lastBlog.likes).toBe(0)
  })

  test('no post without title', async () => {
    await api
      .post('/api/blogs')
      .send(helper.titlelessBlog)
      .expect(400)
  })

  test('no post without url', async () => {
    await api
      .post('/api/blogs')
      .send(helper.urllessBlog)
      .expect(400)
  })
})



