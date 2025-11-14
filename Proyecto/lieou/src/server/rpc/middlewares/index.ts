// Export middleware definitions (client-safe, no server-only imports)
export { AuthSession, AuthMiddleware } from "./auth"

// Export middleware implementations (server-side only)
export { AuthMiddlewareLive } from "./auth.impl"
