import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getShopId } from '@/lib/clerk/helpers'
import { updateBankAccount, deleteBankAccount } from '@/lib/db/queries/bankAccounts'
import { updateBankAccountSchema } from '@/lib/validations/bankAccount.schema'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types'
import type { BankAccount } from '@/lib/db/schema'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse<ApiResponse<BankAccount>>> {
  try {
    await requireRole(['owner', 'manager'])
    const shopId = await getShopId()
    const { id } = await params

    const body: unknown = await req.json()
    const parsed = updateBankAccountSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'Validation error' },
        { status: 400 }
      )
    }

    const account = await updateBankAccount(shopId, id, parsed.data)
    return NextResponse.json({ success: true, data: account })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'UNAUTHORISED') {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    }
    if (msg === 'NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'Bank account not found' }, { status: 404 })
    }
    logger.error('PATCH /api/settings/bank-accounts/[id]', err)
    return NextResponse.json({ success: false, error: 'Failed to update bank account' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    await requireRole(['owner', 'manager'])
    const shopId = await getShopId()
    const { id } = await params

    await deleteBankAccount(shopId, id)
    return NextResponse.json({ success: true, data: { id } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg === 'UNAUTHORISED') {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    }
    logger.error('DELETE /api/settings/bank-accounts/[id]', err)
    return NextResponse.json({ success: false, error: 'Failed to delete bank account' }, { status: 500 })
  }
}
