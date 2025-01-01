import { model, Schema } from 'mongoose'

export interface IPlayer {
  id: number
  name: string
  score: number
}

export interface IHighScoreMemory extends Document {
  levelKey: string
  time: number
  size: number
  type: string
  players: IPlayer[]
  createdAt?: Date
  updatedAt?: Date
}

const PlayerSchema: Schema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  score: { type: Number, required: true },
})

const HighScoreMemorySchema: Schema = new Schema({
  levelKey: { type: String, required: true },
  time: { type: Number, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  players: { type: [PlayerSchema], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

HighScoreMemorySchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export const Memory = model<IHighScoreMemory>('Memory', HighScoreMemorySchema)
