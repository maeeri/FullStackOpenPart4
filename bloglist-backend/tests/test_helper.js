const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const blogToBeAdded = {
  title: 'This is a test blog post',
  author: 'Maija Mehiläinen',
  url: 'www.google.com'
}

const initialUsers = [{
  username: 'maijameh',
  name: 'Maija Mehiläinen',
},
{
  username: 'faijameh',
  name: 'Faija Mehiläinen',
}]

const userToBeAdded = {
  username: 'nilsh',
  name: 'Nils Holgersson',
  password: 'password'
}

const userWithShortUsername = {
  username: 'ab',
  password: 'password'
}

const userWithShortPassword = {
  username: 'username',
  password: 'mn'
}

const titlelessBlog = {
  author: 'Tao Tao',
  url: 'www.taotao.com'
}

const urllessBlog = {
  author: 'Nils Holgersson',
  title: 'I forgot to include the url'
}

const listWithOneBlog = [
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }
]

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

const getToken = async (login) => {
  const response = await api
    .post('/api/login')
    .send(login)
    .expect(200)

  return 'bearer ' + response.body.token
}

const validToken = async () => {
  const token =  await getToken({ username: 'maijameh', password: 'password' })
  return token
}
const nonValidToken = async () => await getToken({ username: 'faijameh', password: 'password' })

const getUsers = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const getBlogs = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ author: 'someone', url: 'n/a', title: 'to be removed' })
  await blog.save()
  const id = blog.id.toString()
  await blog.remove()

  return id
}

module.exports = {
  listWithOneBlog,
  blogs,
  blogToBeAdded,
  getBlogs,
  titlelessBlog,
  urllessBlog,
  nonExistingId,
  initialUsers,
  userToBeAdded,
  getUsers,
  userWithShortUsername,
  userWithShortPassword,
  validToken,
  nonValidToken
}