import { pipe } from 'effect'

type Product = {
  id: string
  sku: string
  name: string
  price: number
  category: 'food' | 'electronics' | 'clothing'
  quantity: number
}

const cart: Product[] = [
  {
    id: '1',
    sku: crypto.randomUUID(),
    name: 'Bread',
    price: 3.5,
    category: 'food',
    quantity: 2,
  },
  {
    id: '2',
    sku: crypto.randomUUID(),
    name: 'T-Shirt',
    price: 20,
    category: 'clothing',
    quantity: 1,
  },
  {
    id: '3',
    sku: crypto.randomUUID(),
    name: 'Headphones',
    price: 99.99,
    category: 'electronics',
    quantity: 1,
  },
]

const applyTax = (product: Product): Product & { taxedPrice: number } => {
  const taxRates = { food: 0.05, clothing: 0.1, electronics: 0.2 }
  const taxRate = taxRates[product.category] ?? 0
  const taxedPrice = product.price * (1 + taxRate)
  return { ...product, taxedPrice }
}

// Discount Logic
const applyDiscount = (
  product: Product & { taxedPrice: number }
): Product & { finalPrice: number } => {
  // $10 off electronics over $100 (pre-tax)
  if (product.category === 'electronics' && product.price >= 100) {
    return { ...product, finalPrice: product.taxedPrice - 10 }
  }

  // 10% off clothing
  if (product.category === 'clothing') {
    return { ...product, finalPrice: product.taxedPrice * 0.9 }
  }

  // No discount
  return { ...product, finalPrice: product.taxedPrice }
}

// Calculate Total Per Item
const computeTotalPerItem = (product: Product & { finalPrice: number }) => ({
  ...product,
  total: product.finalPrice * product.quantity,
})

// Pipeline to Process One Product 🏋🏻‍♀️
const processProduct = (product: Product) =>
  pipe(product, applyTax, applyDiscount, computeTotalPerItem)

// Transform the Entire Cart 🛒
const processedCart = cart.map(processProduct)
console.log('Processed Cart:', processedCart)

// Summarize Cart Totals ➕
const sum = (a: number, b: number) => a + b

const cartTotal = pipe(
  processedCart.map((p) => p.total),
  (totals) => totals.reduce(sum, 0)
)

console.log('Cart Total:', cartTotal.toFixed(2)) // Cart Total: 147.14 💵
