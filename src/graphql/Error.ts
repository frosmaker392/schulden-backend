import { objectType } from 'nexus'

export const Error = objectType({
  name: 'Error',
  definition(t) {
    t.nonNull.string('errorMessage')
  }
})

export const RegisterValidationError = objectType({
  name: 'RegisterValidationError',
  definition(t) {
    t.string('emailErrorMessage')
    t.string('usernameErrorMessage')
    t.string('passwordErrorMessage')
  }
})
