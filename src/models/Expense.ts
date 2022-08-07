import { ID } from '../typeDefs'
import { Debtor } from './Debt'
import { Person } from './Person'

export class Expense {
  constructor(
    private _id: ID,
    private _name: string,
    private _timestamp: Date,
    private _totalAmount: number,
    private _payer: Person,
    private _debtors: Debtor[]
  ) {}

  public get id(): ID {
    return this._id
  }

  public get name(): string {
    return this._name
  }

  public get timestamp(): Date {
    return this._timestamp
  }

  public get totalAmount(): number {
    return this._totalAmount
  }

  public get payer(): Person {
    return this._payer
  }

  public get debtors(): Debtor[] {
    return this._debtors
  }
}
