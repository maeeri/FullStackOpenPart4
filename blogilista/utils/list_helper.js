const logger = require('../utils/logger')
const _ = require('lodash')

//dummy for testing
const dummy = blogs => {
  return 1
}

//helper function to group by author
const groupBloggers = blogs => {
  return _.groupBy(blogs, blog => blog.author)
}

//helper function for sums
const add = (sum, value) => {
  return sum + value
}

//total likes in a group of blog objects
const totalLikes = blogs => {
  let likes = blogs.map(blog => blog.likes)
  return likes.reduce(add, 0)
}

//finds the blog object with most likes
const favouriteBlog = blogs => {
  let likesList = blogs.map(blog => blog.likes)
  let blog = blogs.find(blog => blog.likes === Math.max(...likesList))
  return (blogs.length === 0) ? null : blog
}

//finds the author with most blog objects
const mostBlogs = blogs => {
  let mostBlogs = _.orderBy(groupBloggers(blogs), blogger => Object.values(blogger).length, 'desc')
  let newObj

  if (blogs.length !== 0){
    newObj = {
      author: mostBlogs[0][0].author,
      blogs: mostBlogs[0].length
    }
  }

  return (blogs.length === 0) ? null : newObj
}

//finds the author with most likes
const mostLikes = blogs => {
  if (blogs.length !== 0) {
    let bloggersArray = Object.values(groupBloggers(blogs)).map(x => {
      return {
        author: x[0].author,
        likes: totalLikes(x)
      }
    })
    let mostLikes = _.orderBy(bloggersArray, ['likes'], 'desc')
    return mostLikes[0]
  }
  return null
}

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes }