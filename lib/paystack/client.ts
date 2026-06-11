import crypto from 'crypto'

const BASE = 'https://api.paystack.co'

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set')
  return key
}

async function paystackRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = (await res.json()) as { status: boolean; message: string; data: T }
  if (!json.status) throw new Error(json.message ?? 'Paystack request failed')
  return json.data
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaystackInitData {
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackSubscription {
  id: number
  status: string
  subscription_code: string
  email_token: string
  amount: number
  cron_expression: string
  next_payment_date: string
  open_invoice: string | null
  customer: {
    id: number
    customer_code: string
    email: string
  }
  plan: {
    id: number
    plan_code: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function initializeTransaction(params: {
  email: string
  amount: number
  plan: string
  callback_url: string
  metadata?: Record<string, unknown>
}): Promise<PaystackInitData> {
  return paystackRequest<PaystackInitData>('POST', '/transaction/initialize', params)
}

export async function fetchSubscription(subscriptionCode: string): Promise<PaystackSubscription> {
  return paystackRequest<PaystackSubscription>('GET', `/subscription/${subscriptionCode}`)
}

export async function disableSubscription(params: {
  code: string
  token: string
}): Promise<void> {
  await paystackRequest('POST', '/subscription/disable', params)
}

// ─── Webhook ─────────────────────────────────────────────────────────────────

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return false
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  return hash === signature
}

export function planCodeForPlan(plan: 'growth' | 'pro'): string {
  const key = plan === 'growth' ? process.env.PAYSTACK_PLAN_GROWTH : process.env.PAYSTACK_PLAN_PRO
  if (!key) throw new Error(`Paystack plan code not set for ${plan}`)
  return key
}
