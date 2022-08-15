import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import Validator from '../utils/Validator'
import { JWTPayload, GAuthResult, GUser } from '../typeDefs'
import PersonAdapter from '../adapters/PersonAdapter'
import { UserDao } from '../daos/UserDao'
import { Optional } from '../utils/utilityTypes'

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
  private readonly validatorErrors: Record<keyof RegisterForm, string> = {
    email: 'Invalid email address!',
    username: 'Username must contain between 4 and 20 alphanumeric characters.',
    password:
      'Password must be at least 8 characters long, containing at least one uppercase, one lowercase and one numeric character!'
  }

  private validator: Validator = new Validator()

  constructor(private userDao: UserDao, private jwtSecret: string) {}

  async register(registerForm: RegisterForm): Promise<GAuthResult> {
    const { email, username, password } = registerForm

    for (const k of Object.keys(registerForm)) {
      const field = k as keyof RegisterForm

      if (!this.validator.validate(field, registerForm[field]))
        return {
          errorMessage: this.validatorErrors[field]
        }
    }

    const existingUserWithEmail = await this.userDao.getUniqueByEmail(email)
    const existingUserWithName = await this.userDao.getUniqueByName(username)

    if (existingUserWithEmail || existingUserWithName)
      return {
        errorMessage: 'User already exists with this email or username!'
      }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await this.userDao.create({
      email,
      name: username,
      passwordHash
    })

    const authTokenPayload: JWTPayload = {
      userId: user.id
    }
    const token = jwt.sign(authTokenPayload, this.jwtSecret)

    return {
      token,
      user: PersonAdapter.toGUser(user)
    }
  }

  async login(loginForm: LoginForm): Promise<GAuthResult> {
    const loginErrorMsg = 'Invalid email and password combination!'
    const { email, password } = loginForm

    const user = await this.userDao.getUniqueByEmail(email)
    if (!user) return { errorMessage: loginErrorMsg }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return { errorMessage: loginErrorMsg }

    const authTokenPayload: JWTPayload = {
      userId: user.id
    }
    const token = jwt.sign(authTokenPayload, this.jwtSecret)

    return {
      token,
      user: PersonAdapter.toGUser(user)
    }
  }

  async getUser(id: string): Promise<Optional<GUser>> {
    const user = await this.userDao.getUniqueById(id)
    return user ? PersonAdapter.toGUser(user) : undefined
  }
}
