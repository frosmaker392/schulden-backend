import { Person } from './Person'

export class Debtor {
  constructor(private _person: Person, private _amount: number) {}

  public get person(): Person {
    return this._person
  }

  public get amount(): number {
    return this._amount
  }
}

export class DebtSummary {
  constructor(private _amount: number, private _topDebtors: Debtor[]) {}

  public get amount(): number {
    return this._amount
  }

  public get topDebtors(): Debtor[] {
    return this._topDebtors
  }
}
