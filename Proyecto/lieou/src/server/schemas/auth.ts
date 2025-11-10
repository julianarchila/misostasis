import { User } from "./user"


export type Session = {
  user: User,
  raw: Object & {
    sessionClaims: Object & CustomJwtSessionClaims | null
  },
} 
