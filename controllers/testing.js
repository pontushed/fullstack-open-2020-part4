const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testingRouter.post('/reset', async (response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  console.log('Database reset for testing')
  response.status(200).end()
})

module.exports = testingRouter
