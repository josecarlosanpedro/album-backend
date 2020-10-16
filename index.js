const express = require('express')
const bodyParser = require('body-parser')
const photoRoutes = require('./src/routes/photos')
const app = express()
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})
app.use(photoRoutes)
app.use('/photos', express.static('albums'))

const server = app.listen(process.env.PORT || 8888, function () {
  const port = server.address().port
  console.log('App now running on port', port)
})
