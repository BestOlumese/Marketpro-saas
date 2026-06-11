import { eq, and, isNull, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { staff, sales } from '@/lib/db/schema'

export async function getStaffList(shopId: string) {
  return db.query.staff.findMany({
    where: and(eq(staff.shopId, shopId), isNull(staff.deletedAt)),
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  })
}

export async function getStaffById(id: string, shopId: string) {
  return db.query.staff.findFirst({
    where: and(eq(staff.id, id), eq(staff.shopId, shopId), isNull(staff.deletedAt)),
  })
}

export async function getStaffWithSales(id: string, shopId: string) {
  return db.query.staff.findFirst({
    where: and(eq(staff.id, id), eq(staff.shopId, shopId), isNull(staff.deletedAt)),
    with: {
      sales: {
        where: eq(sales.status, 'completed'),
        orderBy: (s, { desc: d }) => [d(s.createdAt)],
        limit: 50,
        with: { items: true },
      },
      shifts: {
        orderBy: (sh, { desc: d }) => [d(sh.openedAt)],
        limit: 20,
      },
    },
  })
}

export async function getStaffListWithSalesCounts(shopId: string) {
  const members = await db.query.staff.findMany({
    where: and(eq(staff.shopId, shopId), isNull(staff.deletedAt)),
    with: {
      sales: {
        where: eq(sales.status, 'completed'),
        columns: { total: true },
      },
    },
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  })
  return members
}
