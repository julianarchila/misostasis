import { User } from "./user"


export type Session = {
  user: User,
  raw: object & {
    sessionClaims: object & CustomJwtSessionClaims | null
  },
} 
