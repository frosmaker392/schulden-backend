import EnvExtractor from '../../src/utils/EnvExtractor'

const envKeys = ['KEY1', 'KEY2', 'KEY3'] as const

const envExtractor = new EnvExtractor(envKeys, {
  KEY1: 'key1-default',
  KEY2: 'key2-default',
  KEY3: 'key3-default'
})

describe('EnvExtractor', () => {
  describe('getEnvVariables', () => {
    test('returns specified env variables if present', () => {
      const expected = {
        KEY1: 'key1-value',
        KEY2: 'key2-value',
        KEY3: 'key3-value'
      }
      const processEnv: NodeJS.ProcessEnv = {
        ...expected,
        KEY4: 'key4-value'
      }

      const { envObject, warnings } = envExtractor.getEnvVariables(
        processEnv,
        () => ''
      )

      expect(warnings).toHaveLength(0)
      expect(envObject).toEqual(expected)
    })

    test('returns corresponding default values and warnings for missing env variables', () => {
      const processEnv: NodeJS.ProcessEnv = {
        KEY3: 'key3-value'
      }

      const { envObject, warnings } = envExtractor.getEnvVariables(
        processEnv,
        (k, d) => `${k} - ${d}`
      )

      expect(warnings).toEqual(['KEY1 - key1-default', 'KEY2 - key2-default'])
      expect(envObject).toEqual({
        KEY1: 'key1-default',
        KEY2: 'key2-default',
        KEY3: 'key3-value'
      })
    })
  })
})
