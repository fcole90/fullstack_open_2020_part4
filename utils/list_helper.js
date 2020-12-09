const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => (
  blogs.map(blog => blog.likes).reduce((acc, likes) => likes + acc)
)

const favoriteBlog = (blogs) => (
  blogs.reduce((best, blog) => blog.likes > best.likes ? blog : best)
)

// Find the author with most blogs
const mostBlogs = (blogs) => (
  Object.values(blogs.reduce((authorsObject, currentBlog) => (
    currentBlog.author in authorsObject
      ? { // Incrementer
        ...authorsObject,
        [currentBlog.author]: {
          ...authorsObject[currentBlog.author],
          blogs: authorsObject[currentBlog.author].blogs + 1
        }
      }
      : { // Author Initialiser
        ...authorsObject,
        [currentBlog.author]: {
          author: currentBlog.author,
          blogs: 1
        }
      }
  ),
  {} // authorsObject initialiser
  ))
    .reduce((acc, cur) =>  (cur.blogs > acc.blogs ? cur : acc))
)

// Find the author with most likes
const mostLikes = (blogs) => (
  Object.values(blogs.reduce((authorsObject, currentBlog) => (
    currentBlog.author in authorsObject
      ? { // Incrementer
        ...authorsObject,
        [currentBlog.author]: {
          ...authorsObject[currentBlog.author],
          likes: authorsObject[currentBlog.author].likes + currentBlog.likes
        }
      }
      : { // Author Initialiser
        ...authorsObject,
        [currentBlog.author]: {
          author: currentBlog.author,
          likes: currentBlog.likes
        }
      }
  ),
  {} // authorsObject initialiser
  ))
    .reduce((acc, cur) =>  (cur.likes > acc.likes ? cur : acc))
)

module.exports = {
  dummy,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  totalLikes
}