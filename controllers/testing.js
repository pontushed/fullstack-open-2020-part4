const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  response.status(204).send('Database is now reset for testing').end()
})

module.exports = testingRouter
