import { model, Schema } from 'mongoose'

const ColorPaletteSchema: Schema = new Schema(
  {
    id: Number,
    color: String,
    luminance: Number,
    status: String,
    colorFormat: String,
    compliantColors: { type: Schema.Types.Mixed },
  },
  { _id: false }
)

const ColorPalettesSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    versionName: { type: String, required: true },
    colors: { type: [ColorPaletteSchema], required: true, default: [] },
    currentColor: { type: String, required: false },
    mode: { type: String, required: false },
  },
  { timestamps: true }
)

ColorPalettesSchema.index({ user: 1, versionName: 1 }, { unique: true })

export const ColorPalettes = model('ColorPalettes', ColorPalettesSchema)
