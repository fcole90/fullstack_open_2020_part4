const logger = require('./logger')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }
  next()
}

// After routes Middleware
// Needs to be after routes, otherwise it would answer before them
const unknownEndpoint = (request, response) => {
  logger.info('Unknown endpoint:', response)
  response.status(404).send({ error: 'unknown endpoint' })
}

// Generic error handler
const errorHandler = (error, request, response, next) => {
  logger.info('Error Handler:', error)

  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }  else {
    response.status(500).send({ error: `server error: ${error.name}` })
    logger.error(error)
  }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor
}