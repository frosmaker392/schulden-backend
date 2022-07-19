import * as EmailValidator from 'email-validator'

export default class Validator {
  static validateEmail(email: string): boolean {
    return EmailValidator.validate(email)
  }

  static validateUsername(username: string): boolean {
    return /^[a-zA-Z0-9]{4,20}$/.test(username)
  }

  static validatePassword(password: string): boolean {
    // At least one uppercase, one lowercase, one number
    // Minimum 8 characters
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/
    return passwordRegex.test(password)
  }
}
