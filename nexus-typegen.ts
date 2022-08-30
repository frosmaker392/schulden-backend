/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./src/context"




declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  DebtorInputType: { // input type
    amount: number; // Float!
    personId: string; // String!
  }
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  AuthPayload: { // root type
    token: string; // String!
    user: NexusGenRootTypes['User']; // User!
  }
  DebtSummary: { // root type
    topDebtors: NexusGenRootTypes['Debtor'][]; // [Debtor!]!
    totalAmount: number; // Float!
  }
  Debtor: { // root type
    amount: number; // Float!
    person: NexusGenRootTypes['Person']; // Person!
  }
  Expense: { // root type
    debtors: NexusGenRootTypes['Debtor'][]; // [Debtor!]!
    id: string; // String!
    name: string; // String!
    payer: NexusGenRootTypes['Person']; // Person!
    timestamp: string; // String!
    totalAmount: number; // Float!
  }
  Mutation: {};
  OfflinePerson: { // root type
    id: string; // ID!
    name: string; // String!
  }
  Query: {};
  User: { // root type
    email: string; // String!
    id: string; // ID!
    name: string; // String!
  }
}

export interface NexusGenInterfaces {
  Person: NexusGenRootTypes['OfflinePerson'] | NexusGenRootTypes['User'];
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenInterfaces & NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  AuthPayload: { // field return type
    token: string; // String!
    user: NexusGenRootTypes['User']; // User!
  }
  DebtSummary: { // field return type
    topDebtors: NexusGenRootTypes['Debtor'][]; // [Debtor!]!
    totalAmount: number; // Float!
  }
  Debtor: { // field return type
    amount: number; // Float!
    person: NexusGenRootTypes['Person']; // Person!
  }
  Expense: { // field return type
    debtors: NexusGenRootTypes['Debtor'][]; // [Debtor!]!
    id: string; // String!
    name: string; // String!
    payer: NexusGenRootTypes['Person']; // Person!
    timestamp: string; // String!
    totalAmount: number; // Float!
  }
  Mutation: { // field return type
    createExpense: NexusGenRootTypes['Expense']; // Expense!
    createOfflinePerson: NexusGenRootTypes['OfflinePerson']; // OfflinePerson!
    deleteExpense: NexusGenRootTypes['Expense']; // Expense!
    login: NexusGenRootTypes['AuthPayload']; // AuthPayload!
    register: NexusGenRootTypes['AuthPayload']; // AuthPayload!
  }
  OfflinePerson: { // field return type
    id: string; // ID!
    name: string; // String!
  }
  Query: { // field return type
    currentUser: NexusGenRootTypes['User'] | null; // User
    findPersons: NexusGenRootTypes['Person'][]; // [Person!]!
    getAllDebts: NexusGenRootTypes['Debtor'][]; // [Debtor!]!
    getAllExpenses: NexusGenRootTypes['Expense'][]; // [Expense!]!
    getAllRelatedExpenses: NexusGenRootTypes['Expense'][]; // [Expense!]!
    getDebtSummary: NexusGenRootTypes['DebtSummary']; // DebtSummary!
    getExpense: NexusGenRootTypes['Expense']; // Expense!
    getPerson: NexusGenRootTypes['Person']; // Person!
  }
  User: { // field return type
    email: string; // String!
    id: string; // ID!
    name: string; // String!
  }
  Person: { // field return type
    id: string; // ID!
    name: string; // String!
  }
}

export interface NexusGenFieldTypeNames {
  AuthPayload: { // field return type name
    token: 'String'
    user: 'User'
  }
  DebtSummary: { // field return type name
    topDebtors: 'Debtor'
    totalAmount: 'Float'
  }
  Debtor: { // field return type name
    amount: 'Float'
    person: 'Person'
  }
  Expense: { // field return type name
    debtors: 'Debtor'
    id: 'String'
    name: 'String'
    payer: 'Person'
    timestamp: 'String'
    totalAmount: 'Float'
  }
  Mutation: { // field return type name
    createExpense: 'Expense'
    createOfflinePerson: 'OfflinePerson'
    deleteExpense: 'Expense'
    login: 'AuthPayload'
    register: 'AuthPayload'
  }
  OfflinePerson: { // field return type name
    id: 'ID'
    name: 'String'
  }
  Query: { // field return type name
    currentUser: 'User'
    findPersons: 'Person'
    getAllDebts: 'Debtor'
    getAllExpenses: 'Expense'
    getAllRelatedExpenses: 'Expense'
    getDebtSummary: 'DebtSummary'
    getExpense: 'Expense'
    getPerson: 'Person'
  }
  User: { // field return type name
    email: 'String'
    id: 'ID'
    name: 'String'
  }
  Person: { // field return type name
    id: 'ID'
    name: 'String'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createExpense: { // args
      debtors: NexusGenInputs['DebtorInputType'][]; // [DebtorInputType!]!
      name: string; // String!
      payerId: string; // String!
      totalAmount: number; // Float!
    }
    createOfflinePerson: { // args
      name: string; // String!
    }
    deleteExpense: { // args
      expenseId: string; // String!
    }
    login: { // args
      email: string; // String!
      password: string; // String!
    }
    register: { // args
      email: string; // String!
      password: string; // String!
      username: string; // String!
    }
  }
  Query: {
    findPersons: { // args
      name: string; // String!
    }
    getAllRelatedExpenses: { // args
      personId: string; // String!
    }
    getExpense: { // args
      expenseId: string; // String!
    }
    getPerson: { // args
      id: string; // String!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
  Person: "OfflinePerson" | "User"
}

export interface NexusGenTypeInterfaces {
  OfflinePerson: "Person"
  User: "Person"
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = keyof NexusGenInterfaces;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = "Person";

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: Context;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}