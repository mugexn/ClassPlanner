import { sb } from './supabase'

const FUNCTION_NAME = 'swift-function'

export async function adminCall(body) {
  const { data, error } = await sb.functions.invoke(FUNCTION_NAME, { body })
  if (error) {
    let msg = error.message
    if (error.name === 'FunctionsFetchError') {
      msg = `Cannot reach the "${FUNCTION_NAME}" Edge Function. Check its slug in Supabase (Edge Functions) matches FUNCTION_NAME in src/lib/adminApi.js.`
    } else {
      try { const j = await error.context.json(); if (j?.error) msg = j.error } catch {}
    }
    throw new Error(msg)
  }
  if (data?.error) throw new Error(data.error)
  return data
}
