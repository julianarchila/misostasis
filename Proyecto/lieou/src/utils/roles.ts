import { auth } from '@clerk/nextjs/server'
import type { Roles } from '@/types/globals'

export async function checkRole(expected: Roles) {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata?.role === expected
}

export async function getRole(): Promise<Roles | undefined> {
  const { sessionClaims } = await auth()
  return sessionClaims?.metadata?.role as Roles | undefined
}