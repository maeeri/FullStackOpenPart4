const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const { response } = require('../app')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.blogs)
})

describe('endpoints', () => {
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.blogs.length)
  })

  test('a specific blog is returned', async () => {
    const blogs = await helper.getBlogs()

    const blogToView = blogs[2]

    const blogResult = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(blogResult.body).toEqual(blogs[2])
  })

  test('a non-existing id returns not found', async () => {
    const id = helper.nonExistingId

    await api
      .get(`/api/blogs/${id}`)
      .expect(404)
  })
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

describe('delete blog', () => {
  test('blog delete succeeds', async () => {
    const blogsAtStart = await helper.getBlogs()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.getBlogs()

    expect(blogsAtEnd).toHaveLength(helper.blogs.length - 1)
  })

  test('non-valid id delete returns not found', async () => {
    const id = await helper.nonExistingId()
    const blogsAtStart = await helper.getBlogs()

    await api
      .delete(`/api/blogs/${id}`)
      .expect(404)

    const blogsAtEnd = await helper.getBlogs()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length)
  })
})


describe('updating a blog', () => {
  test('can be done', async () => {
    const blogs = await helper.getBlogs()
    const blogObj = blogs[0]
    blogObj.likes = 12

    await api
      .put(`/api/blogs/${blogObj.id}`)
      .send(blogObj)
      .expect(200)

    const blogsAtEnd = await helper.getBlogs()
    expect(blogsAtEnd[0].likes).toBe(12)
  })

  test('non-valid id update returns not found', async () => {
    const id = await helper.nonExistingId()
    const blog = helper.blogToBeAdded

    await api
      .put(`/api/blogs/${id}`)
      .send(blog)
      .expect(404)
  })
})