import mongoose, { Document, Schema } from 'mongoose'

export interface IKey extends Document {
  key: string
}

const KeySchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
})

export default mongoose.models.Key || mongoose.model<IKey>('Key', KeySchema)
