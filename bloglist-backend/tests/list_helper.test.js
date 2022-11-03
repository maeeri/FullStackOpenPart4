const listHelper = require('../utils/list_helper')
const logger = require('../utils/logger')
const helper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []
  expect(listHelper.dummy(blogs)).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    expect(listHelper.totalLikes(helper.listWithOneBlog)).toBe(5)
  })

  test('when list has multiple blogs, equals the sum of likes', () => {
    expect(listHelper.totalLikes(helper.blogs)).toBe(36)
  })
})

describe.only('favourite blog', () => {
  test('of empty list is null', () => {
    expect(listHelper.favouriteBlog([])).toEqual(null)
  })

  test('in a list of one to bet that one', () => {
    expect(listHelper.favouriteBlog(helper.listWithOneBlog)).toEqual(helper.listWithOneBlog[0])
  })

  test('in a list of multiple blogs to be the one with most likes', () => {
    console.log(listHelper.favouriteBlog(helper.blogs))
    expect(listHelper.favouriteBlog(helper.blogs)).toEqual(helper.blogs[2])
  })
})

describe('most blogs', () => {
  test('of empty list is null', () => {
    expect(listHelper.mostBlogs([])).toBe(null)
  })

  test('in a list of one to be that one', () => {
    expect(listHelper.mostBlogs(helper.listWithOneBlog)).toEqual({ author: helper.listWithOneBlog[0].author, blogs: 1 })
  })

  test('in a list with multiple blogs to be author with most written blogs', () => {
    expect(listHelper.mostBlogs(helper.blogs)).toEqual({ author: 'Robert C. Martin', blogs: 3 })
  })
})


describe('most likes', () => {
  test('of empty list is null', () => {
    expect(listHelper.mostLikes([])).toBe(null)
  })

  test('in a list of one to be that one', () => {
    expect(listHelper.mostLikes(helper.listWithOneBlog)).toEqual({ author: helper.listWithOneBlog[0].author, likes: helper.listWithOneBlog[0].likes })
  })

  test('in a list with multiple blogs to be the author with most likes', () => {
    expect(listHelper.mostLikes(helper.blogs)).toEqual({ author: 'Edsger W. Dijkstra', likes: 17 })
  })
})