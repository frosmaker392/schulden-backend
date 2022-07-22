import Validator from '../../src/utils/Validator'

type ValidatorTestCase = [string, boolean]
type Field = Parameters<Validator['validate']>[0]

const validator = new Validator()

describe('Validator', () => {
  const emailTestCases: ValidatorTestCase[] = [
    ['test123@test.com', true],
    ['test123@.com', false],
    ['test123@test', false],
    ['test123', false]
  ]

  const usernameTestCases: ValidatorTestCase[] = [
    ['test123', true],
    ['tes', false],
    ['test123thisusernameislongashell', false],
    ['no-special_chars', false]
  ]

  const passwordTestCases: ValidatorTestCase[] = [
    ['Password123', true],
    ['password123', false],
    ['passwor', false],
    ['PASSWORD123', false]
  ]

  const launchTests = (testCases: ValidatorTestCase[], field: Field) =>
    test.each(testCases)('"%s" => %s', (input, expected) =>
      expect(validator.validate(field, input)).toBe(expected)
    )

  describe('validate email', () => launchTests(emailTestCases, 'email'))
  describe('validate username', () =>
    launchTests(usernameTestCases, 'username'))
  describe('validate password', () =>
    launchTests(passwordTestCases, 'password'))
})
