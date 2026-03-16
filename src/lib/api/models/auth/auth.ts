import { User } from "../user/user";

export interface Auth {
  accessToken: string;
  user: User;
} 

export interface LoginInput {
  email: string;
  password: string;
}