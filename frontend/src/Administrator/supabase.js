// src/Administrator/supabase.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export async function apiLogin(username, password) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) throw new Error("User not found");
  if (data.password_hash !== password) throw new Error("Incorrect password");

  return {
    user: data,
    token: data.id,
  };
}

export async function forgotPassword(username) {
  // 1. Look up email from your custom users table by username
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email")
    .eq("username", username)
    .single();

  if (error || !user) throw new Error("No account found with that username");
  if (!user.email) throw new Error("No email address associated with this account");

  // 2. Use Supabase Auth directly no Edge Function, no tokens table needed
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    user.email,
    {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    }
  );

  if (resetError) throw new Error("Failed to send reset email: " + resetError.message);

  return user.email;
}


// Updated resetPassword uses Supabase Auth session, not custom tokens
export async function resetPassword(newPassword) {
  // At this point Supabase Auth has already verified the token from the email link
  // We just update the password through the active session
  const { error: authError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (authError) throw new Error(authError.message);

  // Keep your custom users table in sync
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (authUser?.email) {
    const { error: dbError } = await supabase
      .from("users")
      .update({ password_hash: newPassword })
      .eq("email", authUser.email);

    if (dbError) throw new Error("Password updated in Auth but failed to sync to users table");
  }
}

export function saveSession(token, user, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("sawo_token", token);
  storage.setItem("sawo_user", JSON.stringify(user));
}

export function getSession() {
  const token =
    localStorage.getItem("sawo_token") || sessionStorage.getItem("sawo_token");
  const userStr =
    localStorage.getItem("sawo_user") || sessionStorage.getItem("sawo_user");
  if (!token || !userStr) return null;
  return { token, user: JSON.parse(userStr) };
}

export function clearSession() {
  localStorage.removeItem("sawo_token");
  localStorage.removeItem("sawo_user");
  sessionStorage.removeItem("sawo_token");
  sessionStorage.removeItem("sawo_user");
}





