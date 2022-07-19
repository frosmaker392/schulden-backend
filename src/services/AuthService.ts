import type { UserDao } from '../daos/UserDao'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { NexusGenUnions } from '../../nexus-typegen'
import Validator from '../utils/Validator'

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
  constructor(private userDao: UserDao, private jwtSecret: string) {}

  async register(registerForm: RegisterForm): Promise<AuthPayload> {
    const { email, username, password } = registerForm

    if (!Validator.validateEmail(email))
      return {
        reason: 'Invalid email address!'
      }
    if (!Validator.validatePassword(password))
      return {
        reason:
          'Password must be at least 8 characters long, containing at least one uppercase, one lowercase and one numeric character!'
      }

    const existingUser = await this.userDao.getByEmail(email)
    if (existingUser)
      return {
        reason: 'User already exists with this email!'
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

    const user = await this.userDao.getByEmail(email)
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
