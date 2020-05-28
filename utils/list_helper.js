const _ = require('lodash')
const dummy = (blogs) => {
  return blogs.length ? 1 : 1
}

const totalLikes = (blogs) => {
  return _(blogs).sumBy('likes')
}

const favoriteBlog = (blogs) => {
  const favorite = _(blogs).sortBy('likes').last()
  delete favorite._id
  delete favorite.__v
  return favorite
}

const mostBlogs = (blogs) => {
  const most = _(blogs).countBy('author').toPairs().last()
  return Object({ author: most[0], blogs: most[1] })
}

const mostLikes = (blogs) => {
  return _.last(
    _.sortBy(
      _(blogs)
        .groupBy('author')
        .map((objs, key) => ({ author: key, likes: _.sumBy(objs, 'likes') }))
        .value(),
      'likes'
    )
  )
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
