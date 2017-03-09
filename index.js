import express from 'express'
import request from 'request'
import fs from 'fs'
import parse from 'body-parser'
import Api from './api'
import YF from 'yahoo-finance'

let app = express()
let jsonParser = parse.json()

app.get('/healthCheck', Api.healthCheck)
app.post('/echo', jsonParser, Api.echo)
app.post('/createStream', jsonParser, Api.createStream)
app.get('/readStream/:id', jsonParser, Api.readStream)
app.get('/readMessages/:id', jsonParser, Api.readMessages)
app.post('/sendMessages/:id', jsonParser, Api.sendMessages)
app.get('/getStock/:symbol', jsonParser, Api.getStock)

app.listen(4000, () => {
  console.log('*************************************************')
  console.log('** Bolt the Bot is Active! **')
  console.log('*************************************************')
})
