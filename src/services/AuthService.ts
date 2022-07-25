import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import Validator from '../utils/Validator'
import { AuthTokenPayload, GAuthPayload } from '../typeDefs'
import { Service } from './Service'
import UserAdapter from '../adapters/UserAdapter'
import { UserDao } from '../daos/UserDao'

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
  private userAdapter: UserAdapter = new UserAdapter()

  constructor(private userDao: UserDao, private jwtSecret: string) {
    super()
  }

  async register(registerForm: RegisterForm): Promise<GAuthPayload> {
    const { email, username, password } = registerForm

    for (const k of Object.keys(registerForm)) {
      const field = k as keyof RegisterForm

      if (!this.validator.validate(field, registerForm[field]))
        return {
          reason: this.validatorErrors[field]
        }
    }

    const userExists =
      (await this.userDao.getManyByNameOrEmail(username, email)).length > 0
    if (userExists)
      return {
        reason: 'User already exists with this email or username!'
      }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await this.userDao.create({
      email,
      name: username,
      passwordHash
    })
    const gUser = this.userAdapter.toGUser(user)

    const authTokenPayload: AuthTokenPayload = {
      userId: user.id
    }
    const token = jwt.sign(authTokenPayload, this.jwtSecret)

    return {
      token,
      user: gUser
    }
  }

  async login(loginForm: LoginForm): Promise<GAuthPayload> {
    const loginErrorMsg = 'Invalid email and password combination!'
    const { email, password } = loginForm

    const user = await this.userDao.getUnique('email', email)
    if (!user) return { reason: loginErrorMsg }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return { reason: loginErrorMsg }

    const authTokenPayload: AuthTokenPayload = {
      userId: user.id
    }
    const token = jwt.sign(authTokenPayload, this.jwtSecret)

    return {
      token,
      user: this.userAdapter.toGUser(user)
    }
  }
}
