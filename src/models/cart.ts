import { model, Schema } from 'mongoose'

export interface ICartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  details?: string
}

export type paid = 'full' | 'partial' | 'none'
export type status = 'pending' | 'in progress' | 'completed' | 'cancelled'

export interface ICart {
  _id?: string
  orderID: string
  info: IInfo
  items: ICartItem[]
  total: number
  extra?: string
  paid: paid
  status: status
  createdAt: Date
  updatedAt?: Date
}

export interface IInfo {
  email: string
  name: string
  companyName?: string
  businessID?: string
  zip: string
  city: string
  address: string
  country: string
  phone?: string
}

const getFinnishTime = (): Date => {
  const now = new Date()
  const utcOffset = now.getTimezoneOffset() * 60000
  const finnishOffset = 2 * 60 * 60000 // Finland is UTC+2
  return new Date(now.getTime() + utcOffset + finnishOffset)
}

const orderIDPattern = /^[0-9]{6}-[A-Za-z]{2}$/

const InfoSchema: Schema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  companyName: { type: String },
  businessID: { type: String },
  zip: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
})

const CartItemSchema: Schema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  details: { type: String, required: false },
  paid: {
    type: String,
    required: true,
    enum: ['full', 'partial', 'none'],
    default: 'none',
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in progress', 'completed', 'cancelled'],
    default: 'pending',
  },
})

const CartSchema: Schema = new Schema({
  orderID: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return orderIDPattern.test(v)
      },
      message: (props: any) =>
        `${props.value} is not a valid orderID! It should follow the format 123456-AB.`,
    },
  },
  info: { type: InfoSchema, required: true },
  items: [CartItemSchema],
  total: { type: Number, required: true },
  extra: { type: String, required: false },
  paid: {
    type: String,
    required: true,
    enum: ['full', 'partial', 'none'],
    default: 'none',
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: getFinnishTime },
  updatedAt: { type: Date, default: getFinnishTime },
})

export const Cart = model('Cart', CartSchema)
