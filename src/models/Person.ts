import { ID } from '../typeDefs'

export interface Person {
  id: ID
  name: string
}

export class User implements Person {
  constructor(
    private _id: ID,
    private _name: string,
    private _email: string,
    private _passwordHash: string
  ) {}

  public get id(): ID {
    return this._id
  }

  public get name(): string {
    return this._name
  }

  public get email(): string {
    return this._email
  }

  public get passwordHash(): string {
    return this._passwordHash
  }
}

export class OfflinePerson implements Person {
  constructor(private _id: ID, private _name: string) {}

  public get id(): ID {
    return this._id
  }

  public get name(): string {
    return this._name
  }
}
