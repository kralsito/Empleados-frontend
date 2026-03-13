import { User } from "../user/user";

export interface Auth {
  token: string;
  user: User;
} 

export interface LoginInput {
  email: string;
  password: string;
}