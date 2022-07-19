import * as EmailValidator from 'email-validator'

export default class Validator {
  static validateEmail(email: string): boolean {
    return EmailValidator.validate(email)
  }

  static validatePassword(password: string): boolean {
    // At least one uppercase, one lowercase, one number
    // Minimum 8 characters
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/
    return passwordRegex.test(password)
  }
}
