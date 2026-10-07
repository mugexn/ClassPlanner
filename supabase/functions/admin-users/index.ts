import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

console.info("admin-users started");

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const admin = ctx.supabaseAdmin;
    const callerId = ctx.userClaims?.id ?? ctx.jwtClaims?.sub;

    // Only admins may use this function
    const { data: me } = await admin.from("profiles").select("role").eq("id", callerId).single();
    if (me?.role !== "admin") return Response.json({ error: "Admins only." }, { status: 403 });

    const b = await req.json();
    if (b.password && String(b.password).length < 6) {
      return Response.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (b.action === "create") {
      if (!b.email || !b.password) {
        return Response.json({ error: "Email and password are required." }, { status: 400 });
      }
      const { error } = await admin.auth.admin.createUser({
        email: b.email,
        password: b.password,
        email_confirm: true,
        user_metadata: { full_name: b.full_name },
      }); // the sign-up trigger creates the profile with the "user" role
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ ok: true });
    }

    if (b.action === "update") {
      const attrs = { user_metadata: { full_name: b.full_name } };
      if (b.email) attrs.email = b.email;
      if (b.password) attrs.password = b.password;
      const { error } = await admin.auth.admin.updateUserById(b.id, attrs);
      if (error) return Response.json({ error: error.message }, { status: 400 });
      await admin
        .from("profiles")
        .update({ full_name: b.full_name, ...(b.email ? { email: b.email } : {}) })
        .eq("id", b.id);
      return Response.json({ ok: true });
    }

    if (b.action === "delete") {
      if (b.id === callerId) {
        return Response.json({ error: "You cannot delete your own account." }, { status: 400 });
      }
      const { error } = await admin.auth.admin.deleteUser(b.id); // schedules, notes and DTR are removed by cascade
      if (error) return Response.json({ error: error.message }, { status: 400 });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action." }, { status: 400 });
  }),
};