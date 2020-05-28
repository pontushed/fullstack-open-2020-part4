const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
//const morgan = require('morgan')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

// morgan.token('body', function (req) {
//   const bodyText = JSON.stringify(req.body)
//   return bodyText.length === 2 ? '' : bodyText
// })

logger.info('connecting to', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

// const mongoUrl = 'mongodb://localhost/bloglist'
// mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())
//app.use(morgan(':method :url :status :response-time ms :body'))
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
