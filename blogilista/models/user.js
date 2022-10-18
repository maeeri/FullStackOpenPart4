const mongoose = require('mongoose')
const Blog = require('../models/blog')
const logger = require('../utils/logger')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    minlegth: 3,
    required: true,
    unique: true,
    message: 'username must be at least 3 characters long and unique'
  },
  name: String,
  password: {
    type: String,
    required: true,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

module.exports = mongoose.model('User', userSchema)