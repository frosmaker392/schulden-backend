import ArgsAdapter from '../../src/adapters/ArgsAdapter'

type Test = {
  a: string
  b?: string
  c?: string | null
  d: string | null
}

describe('ArgsAdapter', () => {
  test('replaceNullsWithUndefineds', () => {
    const object: Test = {
      a: 'test-a',
      b: 'test-b',
      d: null
    }

    const result = ArgsAdapter.replaceNullsWithUndefineds(object)

    expect(result).toEqual({
      a: 'test-a',
      b: 'test-b',
      c: undefined,
      d: undefined
    })
  })
})
