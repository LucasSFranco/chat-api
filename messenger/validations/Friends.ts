import Joi from 'joi'

import { client } from '../../prisma/client'

export class FriendsValidation {
  static add = Joi
    .string()
    .email()
    .required()
    .external(FriendsValidation.checkAddConditions)

  static async checkAddConditions (email: string, { prefs }: any) {
    const checkEmailExistence = async (email: string) => {
      const friend = await client.user.findUnique({
        where: { email: email }
      })

      if (!friend) {
        throw new Joi.ValidationError(
          'The provided email does not exist.',
          [
            {
              message: 'The provided email does not exist.',
              path: [],
              type: 'friends.emailNotExists',
              context: {
                key: null,
                label: 'friends',
                value: email
              }
            }
          ],
          { value: email }
        )
      }

      return friend
    }

    const checkSelf = async (friendId: string, sessionId: string) => {
      if (friendId === sessionId) {
        throw new Joi.ValidationError(
          'The email provided refers to youself.',
          [
            {
              message: 'The email provided refers to youself.',
              path: [],
              type: 'friends.requestSelf',
              context: {
                key: null,
                label: 'friends',
                value: email
              }
            }
          ],
          { value: email }
        )
      }
    }

    const checkFriendship = async (friendId: string, sessionId: string) => {
      const friendship = await client.friend.findUnique({
        where: {
          userId_friendId: { userId: friendId, friendId: sessionId }
        }
      })

      if (friendship) {
        if (friendship.status === 'PENDING' && !friendship.sentByMe) {
          throw new Joi.ValidationError(
            'Already exists a pending request for the user.',
            [
              {
                message: 'Already exists a pending request for the user.',
                path: [],
                type: 'friends.requestAlreadySent',
                context: {
                  key: null,
                  label: 'friends',
                  value: email
                }
              }
            ],
            { value: email }
          )
        }

        if (friendship.status === 'BLOCKED') {
          throw new Joi.ValidationError(
            'The user referring the provided email has blocked you.',
            [
              {
                message: 'The user referring the provided email has blocked you.',
                path: [],
                type: 'friends.blockedByUser',
                context: {
                  key: null,
                  label: 'friends',
                  value: email
                }
              }
            ],
            { value: email }
          )
        }

        if (friendship.status === 'ACCEPTED') {
          throw new Joi.ValidationError(
            'The user is already your friend.',
            [
              {
                message: 'The user is already your friend.',
                path: [],
                type: 'friends.alreadyFriends',
                context: {
                  key: null,
                  label: 'friends',
                  value: email
                }
              }
            ],
            { value: email }
          )
        }
      }
    }

    const friend = await checkEmailExistence(email)
    await checkSelf(friend.id, prefs.context.sessionId)
    await checkFriendship(friend.id, prefs.context.sessionId)

    return friend
  }
}
