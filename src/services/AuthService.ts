import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { NexusGenUnions } from '../../nexus-typegen'
import Validator from '../utils/Validator'
import Dao from '../daos/Dao'
import { User } from '../CommonTypes'
import { Service } from './Service'

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

export default class AuthService extends Service {
  private readonly validatorErrors: Record<keyof RegisterForm, string> = {
    email: 'Invalid email address!',
    username: 'Username must contain between 4 and 20 alphanumeric characters.',
    password:
      'Password must be at least 8 characters long, containing at least one uppercase, one lowercase and one numeric character!'
  }

  private validator: Validator = new Validator()

  constructor(private userDao: Dao<User>, private jwtSecret: string) {
    super()
  }

  async register(registerForm: RegisterForm): Promise<AuthPayload> {
    const { email, username, password } = registerForm

    for (const k of Object.keys(registerForm)) {
      const field = k as keyof RegisterForm

      if (!this.validator.validate(field, registerForm[field]))
        return {
          reason: this.validatorErrors[field]
        }
    }

    const existingUser =
      !!(await this.userDao.getByUnique('email', email)) ||
      !!(await this.userDao.getByUnique('name', username))
    if (existingUser)
      return {
        reason: 'User already exists with this email or username!'
      }

    const passwordHash = await bcrypt.hash(password, 10)

    const { passwordHash: _, ...user } = await this.userDao.create({
      email,
      name: username,
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

    const user = await this.userDao.getByUnique('email', email)
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
