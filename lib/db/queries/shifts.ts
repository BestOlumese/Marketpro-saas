import { eq, and, gte, lte, sum, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { shifts, sales } from '@/lib/db/schema'
import type { NewShift } from '@/lib/db/schema'

export async function getActiveShift(staffId: string, shopId: string) {
  return db.query.shifts.findFirst({
    where: and(
      eq(shifts.staffId, staffId),
      eq(shifts.shopId, shopId),
      eq(shifts.status, 'open'),
    ),
  })
}

export async function getShiftHistory(shopId: string, staffId?: string) {
  return db.query.shifts.findMany({
    where: staffId
      ? and(eq(shifts.shopId, shopId), eq(shifts.staffId, staffId))
      : eq(shifts.shopId, shopId),
    with: {
      staff: { columns: { name: true, role: true } },
    },
    orderBy: [desc(shifts.openedAt)],
    limit: 100,
  })
}

export async function openShift(
  data: Pick<NewShift, 'shopId' | 'staffId' | 'openingCash'>,
) {
  const [shift] = await db.insert(shifts).values(data).returning()
  return shift
}

export async function computeExpectedCash(
  shiftId: string,
  staffId: string,
  shopId: string,
  openedAt: Date,
  openingCash: number,
): Promise<number> {
  const result = await db
    .select({ cashSales: sum(sales.total) })
    .from(sales)
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.staffId, staffId),
        eq(sales.paymentMethod, 'cash'),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, openedAt),
      ),
    )
  const cashSalesTotal = Number(result[0]?.cashSales ?? 0)
  return openingCash + cashSalesTotal
}

export async function closeShift(
  shiftId: string,
  shopId: string,
  closingCash: number,
  expectedCash: number,
  note?: string,
) {
  const [shift] = await db
    .update(shifts)
    .set({
      status: 'closed',
      closingCash,
      expectedCash,
      discrepancy: closingCash - expectedCash,
      note: note ?? null,
      closedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(shifts.id, shiftId), eq(shifts.shopId, shopId), eq(shifts.status, 'open')))
    .returning()
  return shift ?? null
}
