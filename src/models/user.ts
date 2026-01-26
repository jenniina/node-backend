import { IUser } from '../types'
import { model, Schema } from 'mongoose'

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      //unique: true,
      minlength: 3,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
    },
    password: {
      type: String,
      required: true,
      minlength: 3,
    },
    language: {
      type: String,
      required: false,
      minlength: 2,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: Number,
      required: true,
      default: 1,
      max: 3,
      min: 1,
    },
    token: {
      type: String,
      required: false,
    },
    resetToken: {
      type: String,
      required: false,
    },
    confirmToken: {
      type: String,
      required: false,
    },
    blacklistedJokes: [
      {
        jokeId: {
          type: String,
          required: false,
        },
        language: {
          type: String,
          required: false,
        },
        value: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
)

export const User = model<IUser>('User', userSchema)
