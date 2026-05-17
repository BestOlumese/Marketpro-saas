import { create } from 'zustand'

export interface CartItem {
  productId: string
  name: string
  price: number    // kobo
  quantity: number
}

interface CartStore {
  items: CartItem[]
  discount: number   // 0–100 percentage
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setDiscount: (discount: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.productId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === product.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { items: [...state.items, { ...product, quantity: 1 }] }
    })
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }))
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }))
  },

  setDiscount: (discount) => {
    set({ discount: Math.min(100, Math.max(0, discount)) })
  },

  clearCart: () => set({ items: [], discount: 0 }),

  getSubtotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  },

  getTotal: () => {
    const { discount } = get()
    const subtotal = get().getSubtotal()
    return Math.round(subtotal * (1 - discount / 100))
  },
}))
