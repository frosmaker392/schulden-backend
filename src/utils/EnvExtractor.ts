type EnvKeys = readonly string[]
export type EnvObject<T extends EnvKeys> = { [k in T[number]]: string }

interface EnvExtractionResult<T extends EnvKeys> {
  envObject: EnvObject<T>
  warnings: string[]
}

export default class EnvExtractor<T extends EnvKeys> {
  constructor(
    private envKeys: T,
    private defaults: EnvObject<T>,
  ) {}

  getEnvVariables(
    processEnv: NodeJS.ProcessEnv, 
    warningGenerator: (envKey: T[number], defaultValue: string) => string
  ): EnvExtractionResult<T> {
    const envObject: EnvObject<T> = this.envKeys.reduce((acc, key) => {
      acc[key as T[number]] = ""
      return acc
    }, {} as EnvObject<T>)

    const warnings: string[] = []

    for (const envKey of this.envKeys) {
      const defaultValue = this.defaults[envKey as T[number]]
      const value = processEnv[envKey]

      envObject[envKey as T[number]] = value ?? defaultValue

      value ?? 
        warnings.push(
          warningGenerator(envKey, defaultValue)
        )
    }

    Object.freeze(envObject)

    return {
      envObject, 
      warnings
    }
  }
}