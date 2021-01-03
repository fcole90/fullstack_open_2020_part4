const mongoose = require('mongoose')
const { getListWithManyBlogsAuthorIDs } = require('./mockBlogs')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')

const api = supertest(app)

const initialiseTestUserAndGetToken = async () => {
  const username = 'test'
  const password = 'testpass'
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username, passwordHash })
  const response = await user.save()
  if (!response) {
    return response
  }

  const userForToken = {
    username: response.username,
    id: response._id,
  }

  return jwt.sign(userForToken, config.SECRET)
}


beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  const blogObjects = getListWithManyBlogsAuthorIDs()
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})


test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test(`there are ${getListWithManyBlogsAuthorIDs().length} blogs`, async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(getListWithManyBlogsAuthorIDs().length)
})

test('the property \'id\' exists', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach((item) => {
    expect(item.id).toBeDefined()
  })
})


test('if the likes property is missing from the request, it will default to the value 0', async () => {
  const token = await initialiseTestUserAndGetToken()

  const newBlog = {
    title: 'Test 0 Likes',
    author: 'Test Author',
    url: 'https://testing.succeeds.org',
    //likes is missing
  }

  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(newBlog)
    .expect(201)
  expect(postResponse.body.likes).toEqual(0)
})


test('if the title and url properties are missing from the request data, the backend responds to the request with the status code 400 Bad Request', async () => {
  const token = await initialiseTestUserAndGetToken()

  const newBlog = {
    // title is missing
    author: 'Testing suite',
    // url is missing
    likes: 42
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(newBlog)
    .expect(400)
})


test('creating a new blog succeeds', async () => {
  const newBlog = {
    title: 'Test new Blog',
    author: 'Test Author',
    url: 'https://creating.a.new.blog.succeeds.org',
  }

  // Check the get response to not contain yet the object to send
  const getResponseBefore = await api.get('/api/blogs')
  expect(getResponseBefore.body).not.toEqual(
    expect.arrayContaining(
      [expect.objectContaining(newBlog)]
    )
  )
  const lengthBefore = getResponseBefore.body.length

  const token = await initialiseTestUserAndGetToken()

  // Check the post response to contain the sent object
  const postResponse = await api
    .post('/api/blogs')
    .set('Authorization', `bearer ${token}`)
    .send(newBlog)
    .expect(201)

  expect(postResponse.body).toEqual(expect.objectContaining(newBlog))


  // Check the get response to contain the sent object among others
  const getResponse = await api.get('/api/blogs')
  expect(getResponse.body).toEqual(
    expect.arrayContaining(
      [expect.objectContaining(newBlog)]
    )
  )
  expect(getResponse.body).toHaveLength(lengthBefore + 1)
})


afterAll(() => {
  mongoose.connection.close()
})