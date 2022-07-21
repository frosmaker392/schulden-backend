/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { Context } from "./src/context"




declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
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
  AuthFailure: { // root type
    reason: string; // String!
  }
  AuthSuccess: { // root type
    token: string; // String!
    user: NexusGenRootTypes['User']; // User!
  }
  Mutation: {};
  Query: {};
  User: { // root type
    email: string; // String!
    id: string; // String!
    name: string; // String!
  }
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
  AuthPayload: NexusGenRootTypes['AuthFailure'] | NexusGenRootTypes['AuthSuccess'];
}

export type NexusGenRootTypes = NexusGenObjects & NexusGenUnions

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  AuthFailure: { // field return type
    reason: string; // String!
  }
  AuthSuccess: { // field return type
    token: string; // String!
    user: NexusGenRootTypes['User']; // User!
  }
  Mutation: { // field return type
    login: NexusGenRootTypes['AuthPayload']; // AuthPayload!
    register: NexusGenRootTypes['AuthPayload']; // AuthPayload!
  }
  Query: { // field return type
    users: NexusGenRootTypes['User'][]; // [User!]!
  }
  User: { // field return type
    email: string; // String!
    id: string; // String!
    name: string; // String!
  }
}

export interface NexusGenFieldTypeNames {
  AuthFailure: { // field return type name
    reason: 'String'
  }
  AuthSuccess: { // field return type name
    token: 'String'
    user: 'User'
  }
  Mutation: { // field return type name
    login: 'AuthPayload'
    register: 'AuthPayload'
  }
  Query: { // field return type name
    users: 'User'
  }
  User: { // field return type name
    email: 'String'
    id: 'String'
    name: 'String'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
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
}

export interface NexusGenAbstractTypeMembers {
  AuthPayload: "AuthFailure" | "AuthSuccess"
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = keyof NexusGenUnions;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = "AuthPayload";

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