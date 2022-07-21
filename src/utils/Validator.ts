import * as EmailValidator from 'email-validator'

type Field = 'email' | 'username' | 'password'
type ValidatorFun = (value: string) => boolean

export default class Validator {
  // Between 4 and 20 alphanumeric characters
  private readonly usernameRegex = /^[a-zA-Z0-9]{4,20}$/

  // At least 8 characters, with at least one lowercase, one uppercase and one digit
  private readonly passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/

  private readonly validators: Record<Field, ValidatorFun> = {
    email: (v: string) => EmailValidator.validate(v),
    username: (v: string) => new RegExp(this.usernameRegex).test(v),
    password: (v: string) => new RegExp(this.passwordRegex).test(v)
  }

  validate(field: Field, value: string): boolean {
    return this.validators[field](value)
  }
}
