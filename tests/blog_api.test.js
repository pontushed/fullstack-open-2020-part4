const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const helper = require('./test_helper')

describe('Blog API Tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are six blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('the first note is about React patterns', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].title).toBe('React patterns')
  })

  test('the field for identifying the blog is called id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })

  test('the field for identifying the blog is not called _id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0]._id).not.toBeDefined()
  })
})

describe('Blog API Tests logged in', () => {
  let token = ''
  let user = {}

  beforeAll(async () => {
    await User.deleteMany({})
    const newUser = new User({ username: 'tester', password: 'tester' })
    await newUser.save()
    user = newUser
    token =
      'bearer ' +
      jwt.sign(
        { username: newUser.username, id: newUser._id },
        process.env.SECRET
      )
  })

  beforeEach(async () => {
    await Blog.deleteMany({})
    const blogs = helper.initialBlogs
    blogs.forEach((b) => {
      b.user = user._id
    })
    await Blog.insertMany(blogs)
  })

  test('a blog can be added', async () => {
    const newBlog = {
      title: 'GitHub',
      author: 'GitHub Inc.',
      url: 'https://github.com',
      likes: 1,
      user: user._id,
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map((n) => n.title)
    expect(contents).toContain('GitHub')
  })

  test('a blog can not be added without a valid token', async () => {
    const newBlog = {
      title: 'GitHub',
      author: 'GitHub Inc.',
      url: 'https://github.com',
      likes: 1,
      user: user._id,
    }
    await api.post('/api/blogs').send(newBlog).expect(401)
  })

  test('blog without content is not added', async () => {
    const newBlog = {
      somedata: true,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog without likes is set to zero', async () => {
    const newBlog = {
      title: 'GitHub',
      author: 'GitHub Inc.',
      url: 'https://github.com',
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    const contents = blogsAtEnd.find((n) => n.title === 'GitHub')
    expect(contents.likes).toBeDefined()
    expect(contents.likes).toEqual(0)
  })

  describe('Delete one blog', () => {
    test('number of blogs decrease by one', async () => {
      const blogsAtStart = await helper.blogsInDb()
      await api
        .delete('/api/blogs/' + blogsAtStart[0].id)
        .set('Authorization', token)
        .expect(204)
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    })
    test('cannot delete without token', async () => {
      const blogsAtStart = await helper.blogsInDb()
      await api.delete('/api/blogs/' + blogsAtStart[0].id).expect(401)
    })
  })

  describe('Updates', () => {
    test('add one like', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const newLikes = blogsAtStart[0].likes + 1
      blogsAtStart[0].likes = newLikes
      await api
        .put('/api/blogs/' + blogsAtStart[0].id)
        .send(blogsAtStart[0])
        .set('Authorization', token)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd[0]).toEqual(blogsAtStart[0])
    })
  })

  afterAll(() => {
    mongoose.connection.close()
  })
})
