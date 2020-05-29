const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  if (body.username.length < 3 || body.password.length < 3) {
    response
      .status(400)
      .send({ error: 'username or password less than 3 characters' })
      .end()
  }

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', '-user')
  response.json(users.map((u) => u.toJSON()))
})

module.exports = usersRouter
