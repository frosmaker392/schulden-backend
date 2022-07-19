import { extendType, nonNull, objectType, stringArg } from 'nexus'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.nonNull.string('token')
    t.nonNull.field('user', {
      type: 'User'
    })
  }
})

export const AuthMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context) {
        const user = await context.userDao.getByEmail(args.email)
        if (!user) throw new Error('Invalid email and password combination.')

        const valid = await bcrypt.compare(args.password, user.passHash)
        if (!valid) throw new Error('Invalid email and password combination.')

        const token = jwt.sign(
          { userId: user.id },
          process.env.APP_SECRET ?? 'default-secret'
        )

        return {
          token,
          user
        }
      }
    })

    t.nonNull.field('register', {
      type: 'AuthPayload',
      args: {
        username: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg())
      },
      async resolve(parent, args, context) {
        const { username, email } = args
        const passHash = await bcrypt.hash(args.password, 10)

        const user = await context.userDao.create({
          email,
          username,
          passHash
        })

        const token = jwt.sign(
          { userId: user.id },
          process.env.APP_SECRET ?? 'default-secret'
        )

        return {
          token,
          user
        }
      }
    })
  }
})
