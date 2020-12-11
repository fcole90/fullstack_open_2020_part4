const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.username) {
    return response.status(400).json({
      error: 'missing username'
    })
  }

  if (!body.password) {
    return response.status(400).json({
      error: 'missing password'
    })
  }

  const user = await User.findOne({ username: body.username })

  const passwordCorrect = user ? await bcrypt.compare(body.password, user.passwordHash) : null

  if (!(passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, config.SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter