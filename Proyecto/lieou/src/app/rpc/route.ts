import { handler } from "@/server/rpc/server"
import { NextRequest } from "next/server"

/**
 * Next.js route handler for RPC requests
 */
export async function POST(request: NextRequest) {
  return handler(request)
}
