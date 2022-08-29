import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import Validator from '../utils/Validator'
import { JWTPayload, GUser, GAuthPayload } from '../typeDefs'
import PersonAdapter from '../adapters/PersonAdapter'
import { UserDao } from '../daos/UserDao'
import { ForbiddenError, UserInputError } from 'apollo-server'
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

  async register(registerForm: RegisterForm): Promise<GAuthPayload> {
    const { email, username, password } = registerForm

    for (const k of Object.keys(registerForm)) {
      const field = k as keyof RegisterForm

      if (!this.validator.validate(field, registerForm[field]))
        throw new UserInputError(this.validatorErrors[field])
    }

    const existingUserWithEmail = await this.userDao.getUniqueByEmail(email)
    const existingUserWithName = await this.userDao.getUniqueByName(username)

    if (existingUserWithEmail || existingUserWithName)
      throw new UserInputError(
        'User already exists with this email or username!'
      )

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

  async login(loginForm: LoginForm): Promise<GAuthPayload> {
    const loginErrorMsg = 'Invalid email and password combination!'
    const { email, password } = loginForm

    const user = await this.userDao.getUniqueByEmail(email)
    if (!user) throw new UserInputError(loginErrorMsg)

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new UserInputError(loginErrorMsg)

    const authTokenPayload: JWTPayload = {
      userId: user.id
    }
    const token = jwt.sign(authTokenPayload, this.jwtSecret)

    return {
      token,
      user: PersonAdapter.toGUser(user)
    }
  }

  async getUser(id?: string): Promise<Optional<GUser>> {
    if (!id) throw new ForbiddenError('Unauthorized!')

    const user = await this.userDao.getUniqueById(id)
    if (!user) return
    return PersonAdapter.toGUser(user)
  }
}
