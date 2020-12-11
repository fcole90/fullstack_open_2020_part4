const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

// DELETE
userRouter.delete('/:id', async (request, response) => {
  const result = await User.findByIdAndRemove(request.params.id)
  if (result) {
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

// GET all
userRouter.get('/', async (request, response) => {
  const result = await User.find({})
  response.json(result)
})

// GET one
userRouter.get('/:id', async (request, response) => {
  const result = await User.findById(request.params.id)
  if (result) {
    response.json(result)
  } else {
    response.status(404).end()
  }
})

// POST
userRouter.post('/', async (request, response) => {
  const body = request.body

  const saltRounds = 10

  if (body.password.length < 3) {
    response.status(400).json({
      error: 'Mimum password length is 3 characters'
    })
  }

  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const element = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const result = await element.save()
  response.status(201).json(result)
})

// PUT
userRouter.put('/:id', async (request, response) => {
  const element = request.body
  const updatedElement = await User.findByIdAndUpdate(request.params.id, element, {
    new: true,
    runValidators: true,
    context: 'query'
  })
  if (updatedElement) {
    response.json(updatedElement)
  } else {
    response.status(404).end()
  }
})

module.exports = userRouter