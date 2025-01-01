import { model, Schema } from 'mongoose'

const quizSchema: Schema = new Schema(
  {
    highscores: {
      easy: {
        score: { type: Number, default: 0 },
        time: { type: Number, default: 210 },
      },
      medium: {
        score: { type: Number, default: 0 },
        time: { type: Number, default: 210 },
      },
      hard: {
        score: { type: Number, default: 0 },
        time: { type: Number, default: 210 },
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

export const Quiz = model('Quiz', quizSchema)
