const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const decodeToken = (token) => {
  if (!token) {
    return null
  }
  return jwt.verify(token, config.SECRET)
}

// const verifyAuthor = ()

// DELETE
blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = decodeToken(request.token)
  console.log(decodedToken)
  if (!decodedToken?.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  if (blog.user.toString() !== decodedToken.id.toString()) {
    return response.status(403).end()
  }

  const result = await blog.remove()
  if (!result) {
    return response.status(404).end()
  }
  response.status(204).end()
})

// GET all
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

// GET one
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user')
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

// POST
blogsRouter.post('/', async (request, response) => {
  if (!request.token) {
    return response.status(401).json({ error: 'missing token' })
  }

  const decodedToken = jwt.verify(request.token, config.SECRET)
  if (!decodedToken?.id) {
    return response.status(401).json({ error: 'invalid token' })
  }
  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    ...request.body,
    user: user._id
  })

  const result =  await blog.save()
  response.status(201).json(result)
})

// PUT
blogsRouter.put('/:id', async (request, response) => {
  const decodedToken = decodeToken(request.token)
  if (!decodedToken?.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)

  const updatedBlog = {
    ...request.body,
    // If user got populated it can create issues
    user: request.body.user.id ? request.body.user.id : request.body.user
  }

  if (!blog) {
    return response.status(404).end()
  }

  // if (blog.user.toString() !== decodedToken.id.toString()) {
  //   return response.status(403).end()
  // }

  const result = await Blog.findByIdAndUpdate(
    request.params.id,
    updatedBlog,
    {
      new: true,
      runValidators: true,
      context: 'query'
    }
  ).populate('user')
  if (!result) {
    return response.status(404).end()
  }
  response.status(200).json(result)
})

module.exports = blogsRouter