import { model, Schema } from 'mongoose'
import { IUser } from '../types'

const taskSchema: Schema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    complete: {
      type: Boolean,
      required: true,
    },
    priority: {
      type: String,
      enum: ['all', 'low', 'medium', 'high'],
      default: 'low',
    },
    deadline: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['all', 'work', 'personal', 'shopping', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
)

const todoSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    todos: {
      type: [taskSchema],
      default: [],
    },
  },
  { timestamps: true }
)

export const Todo = model('Todo', todoSchema)
