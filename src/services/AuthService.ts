import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { NexusGenUnions } from '../../nexus-typegen'
import Validator from '../utils/Validator'
import Dao from '../daos/Dao'
import { User } from '../CommonTypes'

type AuthPayload = NexusGenUnions['AuthPayload']

interface RegisterForm {
  email: string
  username: string
  password: string
}

interface LoginForm {
  email: string
  password: string
}

export default class AuthService {
  constructor(private userDao: Dao<User>, private jwtSecret: string) {}

  async register(registerForm: RegisterForm): Promise<AuthPayload> {
    const { email, username, password } = registerForm

    if (!Validator.validateEmail(email))
      return {
        reason: 'Invalid email address!'
      }
    if (!Validator.validateUsername(username))
      return {
        reason:
          'Username must contain between 4 and 20 alphanumeric characters.'
      }
    if (!Validator.validatePassword(password))
      return {
        reason:
          'Password must be at least 8 characters long, containing at least one uppercase, one lowercase and one numeric character!'
      }

    const existingUser =
      !!(await this.userDao.getBy('email', email)) ||
      !!(await this.userDao.getBy('username', username))
    if (existingUser)
      return {
        reason: 'User already exists with this email or username!'
      }

    const passwordHash = await bcrypt.hash(password, 10)

    const { passwordHash: _, ...user } = await this.userDao.create({
      email,
      username,
      passwordHash
    })

    const token = jwt.sign({ userId: user.id }, this.jwtSecret)

    return {
      token,
      user
    }
  }

  async login(loginForm: LoginForm): Promise<AuthPayload> {
    const genericErrorMsg = 'Invalid email and password combination!'
    const { email, password } = loginForm

    const user = await this.userDao.getBy('email', email)
    if (!user) return { reason: genericErrorMsg }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return { reason: genericErrorMsg }

    const token = jwt.sign({ userId: user.id }, this.jwtSecret)

    const { passwordHash: _, ...returnedUser } = user

    return {
      token,
      user: returnedUser
    }
  }
}
