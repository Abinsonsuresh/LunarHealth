import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerSupabase() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Safe to ignore: occurs when called from a Server Component
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Safe to ignore: occurs when called from a Server Component
          }
        },
      },
    },
  )
}
