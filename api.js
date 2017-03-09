import fs from 'fs'
import request from 'request'
import config from './config'
import YF from 'yahoo-finance'

let authRequest, authRequestWithTokens

authRequest = request.defaults({
  cert: fs.readFileSync(config.CERT_FILE_PATH),
  key: fs.readFileSync(config.CERT_KEY_FILE_PATH),
  passphrase: config.CERT_PASSPHRASE
})

let setAuthRequestHeaders = () => {
  authRequestWithTokens = request.defaults({
    cert: fs.readFileSync(config.CERT_FILE_PATH),
    key: fs.readFileSync(config.CERT_KEY_FILE_PATH),
    passphrase: config.CERT_PASSPHRASE
    headers: {
      sessionToken: config.SESSION_TOKEN,
      keyManagerToken: config.KM_TOKEN,
      'content-type': 'application/json'
    }
  })
}

let authenticate = () => {
  authRequest.post({ url: config.SESSION_ENDPOINT }, (err, resp, body) => {
    console.log(JSON.parse(body).token)
    config.SESSION_TOKEN = JSON.parse(body).token

    authRequest.post({ url: config.KEY_MANAGER_ENDPOINT }, (err, resp, body) => {
      console.log(JSON.parse(body).token)
      config.KM_TOKEN = JSON.parse(body).token
    })
  })
}

let getUserId = () => {
  authRequestWithTokens.get({ url: config.POD_URL + '/sessioninfo' }, (err, resp, body) => {
    console.log(body)
    if (JSON.parse(body).code === 401) {
      getUserId()
    }
    else {
      config.BOT_ID = JSON.parse(body).userId
    }
  })
}

let createStream = () => {
  authRequestWithTokens.post({
    url: 'http://localhost:4000/createStream'
  }, (err, resp, body) => {
    console.log(body)

    if (JSON.parse(body).code === 500) {
      authenticate()
      setAuthRequestHeaders()
      getUserId()
      createStream()
      return
    }
    else {
      config.STREAM_ID = JSON.parse(body).id

      let readStreamUrl = 'http://localhost:4000/readStream/' + config.STREAM_ID

      console.log(readStreamUrl)

      monitorStream(readStreamUrl)
    }
  })
}

let monitorStream = (readStreamUrl) => {
  authRequestWithTokens.get({
    url: readStreamUrl
  }, (err, resp, body) => {
    if (body !== undefined) {
      if (body.length > 0) {
        let data = JSON.parse(body)
        console.log('read stream=============')
        console.log(data)
        if (data[0] !== undefined) {
          if (data[0].fromUserId !== config.BOT_ID) {
            parseMessage(data)
          }
        }
      }
    }

    monitorStream(readStreamUrl)
  })
}

let parseMessage = (data) => {
  console.log(data)
  let streamId = data[0].streamId
  let message = data[0].message

  if (message.match('/bolt')) {
    if (message.match('<cash tag=')){
      let cashtag = message.split('"')
      console.log(cashtag)
      cashtag = cashtag[1]

      YF.snapshot({
        symbol: cashtag,
        fields: ['s', 'n', 'd1', 'l1', 'y', 'r']
      }, (err, snapshot) => {

        if (snapshot.name === null) {
          authRequestWithTokens.post({
            url: config.AGENT_URL2 + '/stream/' + streamId + ' /message/create',
            json: {
              message: '<messageML> Sorry, there are no companies with that ticker symbol on Yahoo Finance. Did you type it wrongly? </messageML>',
              format: 'MESSAGEML'
            }
          })
        }
        else {
          authRequestWithTokens.post({
            url: config.AGENT_URL2 + '/stream/' + streamId + ' /message/create',
            json: {
              message: '<messageML>' + snapshot.name + ' (' + snapshot.symbol + ') ' + 'is last traded at $' + snapshot.lastTradePriceOnly + '</messageML>',
              format: 'MESSAGEML'
            }
          }, (err, resp, body) => {
            authRequestWithTokens.post({
              url: config.AGENT_URL2 + '/stream/' + streamId + ' /message/create',
              json: {
                message: '<messageML>' + '<a href="https://chart.finance.yahoo.com/z?s=' + cashtag + '&amp;t=1d&amp;q=&amp;l=&amp;z=l&amp;a=v&amp;p=s&amp;lang=en-SG&amp;region=SG.png"/>' + '</messageML>',
                format: 'MESSAGEML'
              }
            }, (err, resp, body) => {
              console.log(body)
            })
          })
        }
      })
    }
    else {
      authRequestWithTokens.post({
        url: config.AGENT_URL2 + '/stream/' + streamId + ' /message/create',
        json: {
          message: '<messageML>' + 'Hi! Enter a $TICKER and I will help you get the last traded price on Yahoo Finance.' + '</messageML>',
          format: 'MESSAGEML'
        }
      }, (err, resp, body) => {
        console.log(body)
      })
    }
  }
}

let heartBeat = () => {
  authRequestWithTokens.get({ url: config.POD_URL + '/sessioninfo' }, (err, resp, body) => {
    console.log(body)
    if (JSON.parse(body).code === 401) {
      console.log('Re-authenticate to get sessionToken and kmToken')
      authenticate()
      setAuthRequestHeaders()
      getUserId()
      createStream()
    }
    else {
      config.BOT_ID = JSON.parse(body).userId
    }
  })
}

authenticate()
setAuthRequestHeaders()
createStream()
getUserId()

setInterval(() => {
  heartBeat()
}, 60000*15)



let Api = {
  healthCheck (req, res) {
    authRequestWithTokens.get({ url: config.AGENT_URL + '/HealthCheck' }, (err, resp, body) => {
      res.send(body)
    })
  },

  findUserByEmail (req, res) {
    authRequestWithTokens.get({ url: config.POD_URL + '/user?email=' + req.params.email }, (err, resp, body) => {
      res.send(body)
    })
  },

  echo (req, res) {
    let data = req.body

    authRequestWithTokens.post({
      url: config.AGENT_URL + '/util/echo',
      json: {
        message: data.message
      }
    }, (err, resp, body) => {
      res.send(body)
    })
  },

  createStream (req, res) {
    let data = req.body

    authRequestWithTokens.post({
      url: config.AGENT_URL + '/datafeed/create'
    }, (err, resp, body) => {
      res.send(body)
    })
  },

  readStream (req, res) {
    let data = req.body

    authRequestWithTokens.get({
      url: config.AGENT_URL2 + '/datafeed/' + req.params.id + '/read'
    }, (err, resp, body) => {
      res.send(body)
    })
  },

  readMessages (req, res) {
    let data = req.body

    authRequestWithTokens.get({
      url: config.AGENT_URL + '/stream/' + req.params.id + ' /message?since=1451577600000',
      json: {
        message: data.message
      }
    }, (err, resp, body) => {
      res.send(body)
    })
  },

  sendMessages (req, res) {
    let data = req.body

    authRequestWithTokens.get({
      url: config.AGENT_URL2 + '/stream/' + req.params.id + ' /message/create',
      json: {
        message: data.message,
        format: 'text'
      }
    }, (err, resp, body) => {
      res.send(body)
    })
  },

  getStock (req, res) {
    let data = req.body

    YF.snapshot({
      symbol: req.params.symbol,
      fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
    }, (err, snapshot) => {
      console.log(snapshot)
    })
  }
}

export default Api