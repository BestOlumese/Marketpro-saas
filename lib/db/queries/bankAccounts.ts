import { db } from '@/lib/db'
import { bankAccounts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { BankAccount, NewBankAccount } from '@/lib/db/schema'

export async function getBankAccounts(shopId: string): Promise<BankAccount[]> {
  return db.query.bankAccounts.findMany({
    where: eq(bankAccounts.shopId, shopId),
    orderBy: (t, { desc }) => [desc(t.isDefault), desc(t.createdAt)],
  })
}

export async function createBankAccount(
  shopId: string,
  input: Pick<NewBankAccount, 'bankName' | 'accountNumber' | 'accountName' | 'isDefault'>
): Promise<BankAccount> {
  if (input.isDefault) {
    await db
      .update(bankAccounts)
      .set({ isDefault: false })
      .where(eq(bankAccounts.shopId, shopId))
  }
  const [account] = await db
    .insert(bankAccounts)
    .values({ ...input, shopId })
    .returning()
  return account!
}

export async function updateBankAccount(
  shopId: string,
  id: string,
  input: Partial<Pick<BankAccount, 'bankName' | 'accountNumber' | 'accountName' | 'isDefault'>>
): Promise<BankAccount> {
  if (input.isDefault) {
    await db
      .update(bankAccounts)
      .set({ isDefault: false })
      .where(eq(bankAccounts.shopId, shopId))
  }
  const [updated] = await db
    .update(bankAccounts)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(bankAccounts.id, id), eq(bankAccounts.shopId, shopId)))
    .returning()
  if (!updated) throw new Error('NOT_FOUND')
  return updated
}

export async function deleteBankAccount(shopId: string, id: string): Promise<void> {
  await db
    .delete(bankAccounts)
    .where(and(eq(bankAccounts.id, id), eq(bankAccounts.shopId, shopId)))
}
