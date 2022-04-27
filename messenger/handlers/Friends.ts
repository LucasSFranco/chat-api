import { ValidationError } from 'joi'
import { Server, Socket } from 'socket.io'
import { Schema } from '../validations'
import { client } from '../../prisma/client'

class FriendsHandler {
  io: Server
  socket: Socket

  constructor (io: Server, socket: Socket) {
    this.io = io
    this.socket = socket

    this.refreshFriendList = this.refreshFriendList.bind(this)
    this.sendRequest = this.sendRequest.bind(this)
    this.acceptRequest = this.acceptRequest.bind(this)
    this.refuseRequest = this.refuseRequest.bind(this)
    this.cancelRequest = this.cancelRequest.bind(this)
    this.removeFriend = this.removeFriend.bind(this)
    this.blockUser = this.blockUser.bind(this)
    this.unblockUser = this.unblockUser.bind(this)
  }

  async refreshFriendList (room: string[] = [this.socket.id]) {
    room.forEach(async (userId) => {
      const friends = await client.friend.findMany({
        where: { userId: userId },
        include: { user: true }
      })

      const friendList = friends.map(friend => ({
        id: friend.friendId,
        username: friend.user.username,
        status: 'online',
        accepted: friend.status === 'ACCEPTED',
        pending: friend.status === 'PENDING',
        blocked: friend.status === 'BLOCKED',
        sentByMe: friend.sentByMe
      }))

      this.io.to(userId).emit('friends:refresh-friend-list', friendList)
    })
  }

  async sendRequest (email: string) {
    try {
      const friend = await Schema.friends.add
        .validateAsync(email, { abortEarly: false, context: { sessionId: this.socket.id } })

      const friendship = await client.friend.findUnique({
        where: {
          userId_friendId: { userId: this.socket.id, friendId: friend.id }
        }
      })

      if (friendship) {
        if (friendship.status === 'BLOCKED') {
          await client.friend.create({
            data: { userId: friend.id, friendId: this.socket.id }
          })

          await client.friend.update({
            data: {
              status: 'PENDING',
              sentByMe: true
            },
            where: {
              userId_friendId: { userId: this.socket.id, friendId: friend.id }
            }
          })
        } else {
          await client.friend.updateMany({
            data: { status: 'ACCEPTED' },
            where: {
              OR: [
                { userId: friend.id, friendId: this.socket.id },
                { userId: this.socket.id, friendId: friend.id }
              ]
            }
          })
        }
      } else {
        await client.friend.createMany({
          data: [
            { userId: this.socket.id, friendId: friend.id, sentByMe: true },
            { userId: friend.id, friendId: this.socket.id }
          ]
        })
      }

      this.refreshFriendList([this.socket.id, friend.id])
    } catch (error: any) {
      if (error.isJoi) {
        const validationError: ValidationError = error

        this.socket.send(validationError.details)
      } else {
        throw error
      }
    }
  }

  async acceptRequest (friendId: string) {
    await client.friend.updateMany({
      data: { status: 'ACCEPTED' },
      where: {
        OR: [
          { userId: friendId, friendId: this.socket.id },
          { userId: this.socket.id, friendId: friendId }
        ]
      }
    })

    this.refreshFriendList([this.socket.id, friendId])
  }

  async refuseRequest (friendId: string) {
    await client.friend.deleteMany({
      where: {
        OR: [
          { userId: friendId, friendId: this.socket.id },
          { userId: this.socket.id, friendId: friendId }
        ]
      }
    })

    this.refreshFriendList([this.socket.id, friendId])
  }

  async cancelRequest (friendId: string) {
    await client.friend.deleteMany({
      where: {
        OR: [
          { userId: friendId, friendId: this.socket.id },
          { userId: this.socket.id, friendId: friendId }
        ]
      }
    })

    this.refreshFriendList([this.socket.id, friendId])
  }

  async removeFriend (friendId: string) {
    await client.friend.deleteMany({
      where: {
        OR: [
          { userId: friendId, friendId: this.socket.id },
          { userId: this.socket.id, friendId: friendId }
        ]
      }
    })

    this.refreshFriendList([this.socket.id, friendId])
  }

  async blockUser (friendId: string) {
    await client.friend.update({
      data: {
        status: 'BLOCKED'
      },
      where: {
        userId_friendId: { userId: this.socket.id, friendId: friendId }
      }
    })

    await client.friend.delete({
      where: {
        userId_friendId: { userId: friendId, friendId: this.socket.id }
      }
    })

    this.refreshFriendList([this.socket.id, friendId])
  }

  async unblockUser (friendId: string) {
    await client.friend.delete({
      where: {
        userId_friendId: { userId: this.socket.id, friendId: friendId }
      }
    })

    this.refreshFriendList([this.socket.id, friendId])
  }
}

export { FriendsHandler }
