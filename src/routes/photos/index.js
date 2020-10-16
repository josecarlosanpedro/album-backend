const express = require('express')
const fs = require('fs')
const getFiles = require('node-recursive-directory')
const isEmpty = require('lodash/isEmpty')
const { uploader } = require('./uploader')

const router = express.Router()

router.get('/health', async (req, res) => {
  const folder = 'albums'
  fs.access(folder, function (err) {
    if (err && err.code === 'ENOENT') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({
        message: 'ERROR'
      }))
      res.end()
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({
      message: 'OK'
    }))
    res.end()
  })
})
router.post('/photos/list', async (req, res) => {
  let files = await getFiles('albums', true)
  files = files.map(item => {
    return {
      album: item.dirname,
      name: item.filename,
      path: `albums/${item.dirname}/${item.filename}`,
      raw: `${req.headers.host}/photos/${item.dirname}/${item.filename}`
    }
  })
  const count = files.length
  const skip = req.body.skip
  const limit = req.body.skip + req.body.limit
  files = files.slice(skip, limit)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.write(JSON.stringify({
    message: 'OK',
    documents: files,
    count,
    skip,
    limit
  }))
  res.end()
})
router.delete('/photos/:albums/:file', async (req, res) => {
  const fileNameWithPath = `albums/${req.params.albums}/${req.params.file}`
  if (fs.existsSync(fileNameWithPath)) {
    fs.unlink(fileNameWithPath, (err) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({
        message: 'OK'
      }))
      res.end()
    })
  }
  res.writeHead(400, { 'Content-Type': 'application/json' })
  res.write(JSON.stringify({
    error: 1,
    message: 'file not found'
  }))
  res.end()
})
router.delete('/photos', async (req, res) => {
  const { body } = req
  if (!Array.isArray(body)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({
      error: 1,
      message: 'body must be an array'
    }))
    res.end()
  }
  const error = []
  const success = []
  body.forEach(item => {
    const documents = item.documents.split(',')
    documents.forEach(document => {
      const fileNameWithPath = `albums/${item.album}/${document.trim()}`
      if (fs.existsSync(fileNameWithPath)) {
        fs.unlink(fileNameWithPath, (err) => {
          error.push(`error while deleting ${item.album}/${document.trim()}`)
        })
        success.push(`${item.album}/${document.trim()} deleted`)
      } else {
        error.push(`${item.album}/${document.trim()} does not exist`)
      }
    })
  })
  if (!isEmpty(error)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({
      error: 1,
      message: {
        error,
        success
      }
    }))
    res.end()
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.write(JSON.stringify({
    message: 'OK'
  }))
  res.end()
})

router.put('/photos', uploader.array('documents'), (req, res, next) => {
    let file = req.files
    file = file.map(item => {
        return ({
            album: item.destination,
            name: item.filename,
            path: item.path,
            raw: `${req.headers.host}/photos/${item.destination}/${item.filename}`
        })
    })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify({
      message: 'OK',
      data: file
    }))
    res.end()
  })

module.exports = router