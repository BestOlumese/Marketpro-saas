import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { getBankAccounts, createBankAccount } from '@/lib/db/queries/bankAccounts'
import { createBankAccountSchema } from '@/lib/validations/bankAccount.schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'
import type { BankAccount } from '@/lib/db/schema'

export async function GET(): Promise<NextResponse<ApiResponse<BankAccount[]>>> {
  try {
    await requireRole(['org:admin', 'org:manager', 'org:cashier'])
    const shopId = await getShopId()
    const accounts = await getBankAccounts(shopId)
    return NextResponse.json({ success: true, data: accounts })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'UNAUTHORISED') {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    }
    logger.error('GET /api/settings/bank-accounts', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch bank accounts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<BankAccount>>> {
  try {
    await requireRole(['org:admin', 'org:manager'])
    const shopId = await getShopId()

    const body: unknown = await req.json()
    const parsed = createBankAccountSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    const account = await createBankAccount(shopId, parsed.data)
    return NextResponse.json({ success: true, data: account }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'UNAUTHORISED') {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    }
    logger.error('POST /api/settings/bank-accounts', err)
    return NextResponse.json({ success: false, error: 'Failed to create bank account' }, { status: 500 })
  }
}
