const { beforeEach, expect } = require('@jest/globals')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)


describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })


  test('creation succeeds with a fresh username', async () => {

    // Check the get response to not contain yet the object to send
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    const getResponseBefore = await api.get('/api/users')
    expect(getResponseBefore.body).not.toEqual(
      expect.arrayContaining(
        [expect.objectContaining(newUser)]
      )
    )

    // Check the post response to contain the sent object
    const postResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // Check if this is the element we sent
    expect(postResponse.body).toEqual(expect.objectContaining({
      username: newUser.username,
      name: newUser.name,
    }))

    // Check the get response to contain the sent object among others
    const getResponse = await api.get('/api/users')
    expect(getResponse.body).toEqual(
      expect.arrayContaining(
        [expect.objectContaining({
          username: newUser.username,
          name: newUser.name,
        })]
      )
    )
  })


  test('creation fails with a short password', async () => {
    // Check the get response to not contain yet the object to send
    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'xx',
    }


    // Check the post response to be bad request
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })


  test('creation fails with a short username', async () => {
    // Check the get response to not contain yet the object to send
    const newUser = {
      username: 'ml',
      name: 'Matti Luukkainen',
      password: 'xxxxxxxx',
    }

    // Check the post response to be bad request
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })


  test('login fails with wrong password', async () => {
    // Check the get response to not contain yet the object to send
    const loginUser = {
      username: 'root',
      password: 'wrongpass',
    }


    // Check the post response to be unhautorised
    await api
      .post('/api/login')
      .send(loginUser)
      .expect(401)
  })


  test('login succeeds with correct password', async () => {
    // Check the get response to not contain yet the object to send
    const loginUser = {
      username: 'root',
      password: 'sekret',
    }

    // Check the post response to be unhautorised
    const tokenResponse = await api
      .post('/api/login')
      .send(loginUser)
      .expect(200)

    expect(tokenResponse.body.token)
      .toBeDefined()

    expect(typeof tokenResponse.body.token.toString())
      .toBe('string')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})