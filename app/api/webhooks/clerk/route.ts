import { NextResponse } from 'next/server'

// Clerk webhooks are no longer used. Auth is handled by Better Auth.
export function POST() {
  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
}
