import { model, Schema } from 'mongoose'

const jokeSchema: Schema = new Schema(
  {
    jokeId: {
      type: String,
      required: true,
      unique: false,
    },
    type: {
      type: String,
      required: true,
      enum: ['single', 'twopart'],
    },
    category: {
      type: String,
      required: true,
      // enum: ['Any', 'Misc', 'Programming', 'Dark', 'Pun', 'Spooky', 'Christmas'],
    },
    subCategories: {
      type: [String],
      required: false,
    },
    language: {
      type: String,
      required: true,
      //enum: ['en', 'es', 'fr', 'de', 'pt', 'cs', 'fi'],
    },
    safe: {
      type: Boolean,
      required: true,
    },
    user: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    ],
    setup: {
      type: String,
    },
    delivery: {
      type: String,
    },
    joke: {
      type: String,
    },
    flags: {
      nsfw: {
        type: Boolean,
        required: false,
      },
      religious: {
        type: Boolean,
        required: false,
      },
      political: {
        type: Boolean,
        required: false,
      },
      racist: {
        type: Boolean,
        required: false,
      },
      sexist: {
        type: Boolean,
        required: false,
      },
      explicit: {
        type: Boolean,
        required: false,
      },
    },
    private: {
      type: Boolean,
      required: false,
    },
    verified: {
      type: Boolean,
      required: false,
    },
    anonymous: {
      type: Boolean,
      required: false,
    },
    author: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
)

export const Joke = model('Joke', jokeSchema)
