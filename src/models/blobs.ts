import { model, Schema } from 'mongoose'

const BlobSchema: Schema = new Schema({
  layer: Number,
  id: String,
  number: Number,
  i: Number,
  x: String,
  y: String,
  z: String,
  background: String,
  function: { type: Schema.Types.Mixed },
})

const BlobsSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  d: { type: Number, required: true },
  draggables: [BlobSchema],
  backgroundColor: {
    type: [String],
    validate: {
      validator: arrayLimit,
      message:
        'Color array must contain exactly three strings representing hue, saturation, and lightness.',
    },
  },
  versionName: { type: String, required: true },
})

function arrayLimit(val: string[]) {
  return val.length === 3
}

export const Blobs = model('Blobs', BlobsSchema)
