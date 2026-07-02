import { withSupabase } from "npm:@supabase/server"

export default {
  fetch: withSupabase({ auth: "user" }, async (_req, ctx) => {
    // ctx.supabase is RLS-scoped using the user's JWT
    // ctx.supabaseAdmin bypasses RLS using the secret key
    const { data, error } = await ctx.supabase.from("todos").select()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data)
  }),
}
