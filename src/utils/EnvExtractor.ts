type EnvKeys = readonly string[]

export type EnvObject<T extends EnvKeys> = { [k in T[number]]: string }

export default class EnvExtractor<T extends EnvKeys> {
  constructor(private envKeys: T) {}

  getEnvVariables(processEnv: NodeJS.ProcessEnv): EnvObject<T> {
    const envObject: EnvObject<T> = {} as EnvObject<T>

    for (const envKey of this.envKeys) {
      const value = processEnv[envKey]
      if (value === undefined)
        throw new Error(`Cannot find env variable with key ${envKey}!`)

      envObject[envKey as T[number]] = value
    }

    Object.freeze(envObject)

    return envObject
  }
}
