import { db } from '@/lib/db'
import { sales, saleItems, products, staff } from '@/lib/db/schema'
import { eq, and, gte, lte, isNull, sql } from 'drizzle-orm'

export interface SalesSummaryItem {
  date: string
  revenue: number  // kobo
  count: number
}

export interface TopProduct {
  productId: string | null
  name: string
  totalQty: number
  totalRevenue: number  // kobo
}

export interface StaffPerformance {
  staffId: string | null
  staffName: string
  saleCount: number
  totalRevenue: number  // kobo
}

export interface ProfitReport {
  revenue: number        // kobo
  estimatedCost: number  // kobo — uses current product cost price, not historical
  profit: number         // kobo
  margin: number         // percentage 0–100
}

export interface DashboardMetrics {
  salesToday: number      // kobo
  itemsSoldToday: number
  lowStockCount: number
  activeStaffCount: number
}

function toDate(s: string): Date {
  return new Date(s + 'T00:00:00.000Z')
}

function toDateEnd(s: string): Date {
  return new Date(s + 'T23:59:59.999Z')
}

export async function getSalesSummary(
  shopId: string,
  from: string,
  to: string
): Promise<SalesSummaryItem[]> {
  const rows = await db
    .select({
      date:    sql<string>`TO_CHAR(${sales.createdAt} AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD')`.as('date'),
      revenue: sql<number>`COALESCE(SUM(${sales.total}), 0)`.as('revenue'),
      count:   sql<number>`COUNT(*)`.as('count'),
    })
    .from(sales)
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, toDate(from)),
        lte(sales.createdAt, toDateEnd(to))
      )
    )
    .groupBy(sql`TO_CHAR(${sales.createdAt} AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${sales.createdAt} AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD')`)

  return rows.map((r) => ({
    date:    r.date,
    revenue: Number(r.revenue),
    count:   Number(r.count),
  }))
}

export async function getTopProducts(
  shopId: string,
  from: string,
  to: string,
  limit = 10
): Promise<TopProduct[]> {
  const rows = await db
    .select({
      productId:    saleItems.productId,
      name:         saleItems.name,
      totalQty:     sql<number>`SUM(${saleItems.quantity})`.as('total_qty'),
      totalRevenue: sql<number>`SUM(${saleItems.subtotal})`.as('total_revenue'),
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, toDate(from)),
        lte(sales.createdAt, toDateEnd(to))
      )
    )
    .groupBy(saleItems.productId, saleItems.name)
    .orderBy(sql`SUM(${saleItems.subtotal}) DESC`)
    .limit(limit)

  return rows.map((r) => ({
    productId:    r.productId,
    name:         r.name,
    totalQty:     Number(r.totalQty),
    totalRevenue: Number(r.totalRevenue),
  }))
}

export async function getStaffPerformance(
  shopId: string,
  from: string,
  to: string
): Promise<StaffPerformance[]> {
  const rows = await db
    .select({
      staffId:      sales.staffId,
      staffName:    sql<string>`COALESCE(${staff.name}, 'Unknown')`.as('staff_name'),
      saleCount:    sql<number>`COUNT(${sales.id})`.as('sale_count'),
      totalRevenue: sql<number>`COALESCE(SUM(${sales.total}), 0)`.as('total_revenue'),
    })
    .from(sales)
    .leftJoin(staff, eq(sales.staffId, staff.id))
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, toDate(from)),
        lte(sales.createdAt, toDateEnd(to))
      )
    )
    .groupBy(sales.staffId, staff.name)
    .orderBy(sql`COALESCE(SUM(${sales.total}), 0) DESC`)

  return rows.map((r) => ({
    staffId:      r.staffId,
    staffName:    r.staffName,
    saleCount:    Number(r.saleCount),
    totalRevenue: Number(r.totalRevenue),
  }))
}

export async function getProfitReport(
  shopId: string,
  from: string,
  to: string
): Promise<ProfitReport> {
  const [revenueRow] = await db
    .select({
      revenue: sql<number>`COALESCE(SUM(${sales.total}), 0)`.as('revenue'),
    })
    .from(sales)
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, toDate(from)),
        lte(sales.createdAt, toDateEnd(to))
      )
    )

  const [costRow] = await db
    .select({
      estimatedCost: sql<number>`COALESCE(SUM(${saleItems.quantity} * ${products.costPrice}), 0)`.as('estimated_cost'),
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .leftJoin(products, eq(saleItems.productId, products.id))
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, toDate(from)),
        lte(sales.createdAt, toDateEnd(to))
      )
    )

  const revenue      = Number(revenueRow?.revenue ?? 0)
  const estimatedCost = Number(costRow?.estimatedCost ?? 0)
  const profit       = revenue - estimatedCost
  const margin       = revenue > 0 ? Math.round((profit / revenue) * 100) : 0

  return { revenue, estimatedCost, profit, margin }
}

export async function getDashboardMetrics(shopId: string): Promise<DashboardMetrics> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const [salesRow] = await db
    .select({
      salesToday:    sql<number>`COALESCE(SUM(${sales.total}), 0)`.as('sales_today'),
    })
    .from(sales)
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, todayStart),
        lte(sales.createdAt, todayEnd)
      )
    )

  const [itemsRow] = await db
    .select({
      itemsSoldToday: sql<number>`COALESCE(SUM(${saleItems.quantity}), 0)`.as('items_sold_today'),
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .where(
      and(
        eq(sales.shopId, shopId),
        eq(sales.status, 'completed'),
        gte(sales.createdAt, todayStart),
        lte(sales.createdAt, todayEnd)
      )
    )

  const [lowStockRow] = await db
    .select({
      lowStockCount: sql<number>`COUNT(*)`.as('low_stock_count'),
    })
    .from(products)
    .where(
      and(
        eq(products.shopId, shopId),
        isNull(products.deletedAt),
        sql`${products.stock} <= ${products.lowStockAt}`
      )
    )

  const [staffRow] = await db
    .select({
      activeStaffCount: sql<number>`COUNT(*)`.as('active_staff_count'),
    })
    .from(staff)
    .where(
      and(
        eq(staff.shopId, shopId),
        isNull(staff.deletedAt)
      )
    )

  return {
    salesToday:       Number(salesRow?.salesToday ?? 0),
    itemsSoldToday:   Number(itemsRow?.itemsSoldToday ?? 0),
    lowStockCount:    Number(lowStockRow?.lowStockCount ?? 0),
    activeStaffCount: Number(staffRow?.activeStaffCount ?? 0),
  }
}

export async function getSalesForExport(
  shopId: string,
  from: string,
  to: string
) {
  return db.query.sales.findMany({
    where: and(
      eq(sales.shopId, shopId),
      eq(sales.status, 'completed'),
      gte(sales.createdAt, toDate(from)),
      lte(sales.createdAt, toDateEnd(to))
    ),
    with: { items: true, staff: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  })
}
