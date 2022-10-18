const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const request = require('request')
const bcrypt = require('bcryptjs')

jest.setTimeout(10000)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const user = await User.create(new User({ username: 'maijameh', name: 'Maija Mehiläinen', password: await bcrypt.hash('password', 10) }))
  const blogs = await Blog.insertMany(helper.blogs)
  blogs.map(async (blog) => {
    blog.user = user._id
    user.blogs = user.blogs.concat(blog._id)
    await blog.save()
  })
  await user.save()
})

describe('endpoints', () => {
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs').set({ 'Authorization': await helper.validToken() })
    expect(response.body).toHaveLength(helper.blogs.length)
  })

  test('a specific blog is returned', async () => {
    const blogs = await helper.getBlogs()

    const blogToView = blogs[2]

    const blogResult = await api
      .get(`/api/blogs/${blogToView.id}`)
      .set({ 'Authorization': await helper.validToken() })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(blogResult.body._id).toEqual(blogs[2]._id)
  })

  test('a non-existing id returns not found', async () => {
    const id = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${id}`)
      .set({ 'Authorization': await helper.validToken() })
      .expect(404)
  })
})


test('id is called id', async () => {
  const response = await api.get('/api/blogs').set({ 'Authorization': await helper.validToken() })
  const blog = response.body[0]
  logger.info(response.body)
  expect(blog.id).toBeDefined()
})

describe('post request tests', () => {
  test('post request without token returns unauthorized', async () => {

    await api
      .post('/api/blogs')
      .send(helper.blogToBeAdded)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogs = await (await helper.getBlogs()).map(blog => {
      return {
        author: blog.author,
        title: blog.title,
        url: blog.url
      }})
    expect(blogs.length).toBe(helper.blogs.length)
    expect(blogs).not.toContainEqual(helper.blogToBeAdded)
  })

  test('blog will be added with token', async () => {
    const blog = new Blog( helper.blogToBeAdded )

    await api
      .post('/api/blogs')
      .send(blog)
      .set({ 'Authorization': await helper.validToken() })
      .expect(201)
  })

  test('likes defaulted', async () => {
    await api
      .post('/api/blogs')
      .send(helper.blogToBeAdded)
      .set({ 'Authorization': await helper.validToken() })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const lastBlog = await Blog.findOne({ author: 'Maija Mehiläinen' })
    expect(lastBlog.likes).toBe(0)
  })

  test('no post without title', async () => {
    await api
      .post('/api/blogs')
      .send(helper.titlelessBlog)
      .set({ 'Authorization': await helper.validToken() })
      .expect(400)
  })

  test('no post without url', async () => {
    await api
      .post('/api/blogs')
      .send(helper.urllessBlog)
      .set({ 'Authorization': await helper.validToken() })
      .expect(400)
  })
})

describe('delete blog', () => {
  test('blog delete succeeds', async () => {
    const blogsAtStart = await helper.getBlogs()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ 'Authorization': await helper.validToken() })
      .expect(204)

    const blogsAtEnd = await helper.getBlogs()

    expect(blogsAtEnd).toHaveLength(helper.blogs.length - 1)
  })

  test('non-valid id delete returns not found', async () => {
    const id = await helper.nonExistingId()
    const blogsAtStart = await helper.getBlogs()
    logger.info('delete id: ', id)

    await api
      .delete(`/api/blogs/${id}`)
      .set({ 'Authorization': await helper.validToken() })
      .expect(404)

    const blogsAtEnd = await helper.getBlogs()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length)
  })

  test('invalid token returns token not valid', async () => {
    const blogs = await helper.getBlogs()
    const blog = blogs[0]
    User.create({ username: 'faijameh', name: 'Faija Mehiläinen', password: await bcrypt.hash('password', 10) })

    await api
      .delete(`/api/blogs/${blog.id}`)
      .set({ 'Authorization': await helper.nonValidToken() })
      .send(blog)
      .expect(401)
  })
})


describe('updating a blog', () => {
  test('can be done', async () => {
    const blogs = await helper.getBlogs()
    logger.info('blogs: ', blogs)
    const blogObj = blogs[0]
    logger.info(blogObj)
    blogObj.likes = 12

    await api
      .put(`/api/blogs/${blogObj.id}`)
      .set({ 'Authorization': await helper.validToken() })
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
      .set({ 'Authorization': await helper.validToken() })
      .send(blog)
      .expect(404)
  })

  test('invalid token returns token not valid', async () => {
    const blogs = await helper.getBlogs()
    const blog = blogs[0]
    User.create({ username: 'faijameh', name: 'Faija Mehiläinen', password: await bcrypt.hash('password', 10) })

    await api
      .put(`/api/blogs/${blog.id}`)
      .set({ 'Authorization': await helper.nonValidToken() })
      .send(blog)
      .expect(401)
  })
})