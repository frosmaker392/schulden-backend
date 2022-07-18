import { UserDao, UserMemoryDao } from "./daos/UserDao";

export const userDao = new UserMemoryDao()

export interface Context { 
  userDao: UserDao
}

export const context: Context = {
  userDao
}