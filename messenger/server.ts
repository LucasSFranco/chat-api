/* eslint-disable new-cap */

import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server, Socket } from 'socket.io'
import { authentication } from './middlewares/authentication'
import { Handler } from './handlers'

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
})

io.use(authentication)

io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}.`)

  socket.on('friends:refresh-friend-list', new Handler.friends(io, socket).refreshFriendList)
  socket.on('friends:send-request', new Handler.friends(io, socket).sendRequest)
  socket.on('friends:accept-request', new Handler.friends(io, socket).acceptRequest)
  socket.on('friends:refuse-request', new Handler.friends(io, socket).refuseRequest)
  socket.on('friends:cancel-request', new Handler.friends(io, socket).cancelRequest)
  socket.on('friends:remove-friend', new Handler.friends(io, socket).removeFriend)
  socket.on('friends:block-user', new Handler.friends(io, socket).blockUser)
  socket.on('friends:unblock-user', new Handler.friends(io, socket).unblockUser)

  socket.on('disconnect', () => console.log('Client disconnected.'))
})

server.listen(8000)
