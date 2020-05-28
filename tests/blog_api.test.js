const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const helper = require('./test_helper')

describe('API Tests', () => {
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

  test('a blog can be added', async () => {
    const newBlog = {
      title: 'GitHub',
      author: 'GitHub Inc.',
      url: 'https://github.com',
      likes: 1,
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map((n) => n.title)
    expect(contents).toContain('GitHub')
  })

  test('blog without content is not added', async () => {
    const newBlog = {
      somedata: true,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

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
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    const contents = blogsAtEnd.find((n) => n.title === 'GitHub')
    expect(contents.likes).toBeDefined()
    expect(contents.likes).toEqual(0)
  })

  afterAll(() => {
    mongoose.connection.close()
  })
})
