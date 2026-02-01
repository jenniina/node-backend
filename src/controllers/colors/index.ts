import { Request, Response } from 'express'
import { User } from '../../models/user'
import { ColorPalettes } from '../../models/colorPalettes'
import { IUser } from '../../types'

type ColorBlockPayload = {
  id: number
  color: string
  luminance: number
  status: string
  colorFormat: 'hex' | 'rgb' | 'hsl'
  compliantColors: {
    AA_RegularText: number[]
    AAA_RegularText: number[]
    AA_UIComponents: number[]
  }
}

type ColorAccessibilityPayload = {
  colors: ColorBlockPayload[]
  currentColor?: string
  mode?: string
}

const getUserFromReq = (req: Request): IUser | null => {
  return (
    ((req as unknown as { user?: IUser }).user as IUser | undefined) ?? null
  )
}

const isValidColorBlock = (block: unknown): block is ColorBlockPayload => {
  const b = block as Partial<ColorBlockPayload>
  if (!b || typeof b !== 'object') return false
  if (typeof b.id !== 'number') return false
  if (typeof b.color !== 'string') return false
  if (typeof b.luminance !== 'number') return false
  if (typeof b.status !== 'string') return false
  if (
    b.colorFormat !== 'hex' &&
    b.colorFormat !== 'rgb' &&
    b.colorFormat !== 'hsl'
  )
    return false

  const cc = (b as ColorBlockPayload).compliantColors
  if (!cc || typeof cc !== 'object') return false
  if (!Array.isArray(cc.AA_RegularText)) return false
  if (!Array.isArray(cc.AAA_RegularText)) return false
  if (!Array.isArray(cc.AA_UIComponents)) return false
  return true
}

const getColorAccessibility = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = getUserFromReq(req)
    if (!user?._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }

    const fresh = await User.findById(user._id).select('colorAccessibility')
    res.status(200).json({
      success: true,
      colorAccessibility:
        (fresh as unknown as { colorAccessibility?: unknown })
          ?.colorAccessibility ?? null,
    })
  } catch (error) {
    console.error('getColorAccessibility error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

const saveColorAccessibility = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = getUserFromReq(req)
    if (!user?._id) {
      res.status(401).json({ success: false, message: 'Unauthorized' })
      return
    }

    const body = req.body as Partial<ColorAccessibilityPayload>
    const colorsUnknown = body.colors

    if (!Array.isArray(colorsUnknown)) {
      res.status(400).json({ success: false, message: 'Invalid payload' })
      return
    }

    // Small hard limit to avoid unbounded payloads.
    if (colorsUnknown.length > 200) {
      res.status(400).json({ success: false, message: 'Too many colors' })
      return
    }

    if (!colorsUnknown.every(isValidColorBlock)) {
      res.status(400).json({ success: false, message: 'Invalid color blocks' })
      return
    }

    const update = {
      colorAccessibility: {
        colors: colorsUnknown,
        currentColor:
          typeof body.currentColor === 'string' ? body.currentColor : undefined,
        mode: typeof body.mode === 'string' ? body.mode : undefined,
        updatedAt: new Date(),
      },
    }

    const updated = await User.findByIdAndUpdate(user._id, update, {
      new: true,
      runValidators: false,
    }).select('colorAccessibility')

    res.status(200).json({
      success: true,
      message: 'Saved',
      colorAccessibility:
        (updated as unknown as { colorAccessibility?: unknown })
          ?.colorAccessibility ?? null,
    })
  } catch (error) {
    console.error('saveColorAccessibility error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export { getColorAccessibility, saveColorAccessibility }

const getAuthUserId = (req: Request): string | undefined => {
  const authUser = (req as unknown as { user?: { _id?: unknown } }).user
  const id = authUser?._id
  return id ? String(id) : undefined
}

const ensureSelf = (req: Request, res: Response): boolean => {
  const authUserId = getAuthUserId(req)
  const targetUserId = String(req.params.user)
  if (!authUserId || authUserId !== targetUserId) {
    res.status(403).send('Forbidden')
    return false
  }
  return true
}

const getAllColorPalettesByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!ensureSelf(req, res)) return
    const { user } = req.params
    if (!user) {
      res.status(400).send('Invalid request params')
      return
    }

    const palettes = await ColorPalettes.find({ user }).sort({ versionName: 1 })
    res.status(200).json(palettes)
  } catch (error) {
    console.error('getAllColorPalettesByUser error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

const getColorPaletteByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!ensureSelf(req, res)) return
    const { user, versionName } = req.params
    if (!user || !versionName) {
      res.status(400).send('Invalid request params')
      return
    }

    const palette = await ColorPalettes.findOne({ user, versionName })
    if (!palette) {
      res.status(404).send('Not found')
      return
    }

    res.status(200).json(palette)
  } catch (error) {
    console.error('getColorPaletteByUser error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

const saveColorPaletteByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!ensureSelf(req, res)) return
    const { user, versionName } = req.params
    const { colors, currentColor, mode } = req.body as {
      colors?: unknown
      currentColor?: unknown
      mode?: unknown
    }

    if (!user || !versionName || !Array.isArray(colors)) {
      res.status(400).send('Invalid request params or body')
      return
    }

    if (versionName.trim().length === 0 || versionName.length > 30) {
      res.status(400).send('Invalid name')
      return
    }

    if (colors.length > 200) {
      res.status(400).send('Too many colors')
      return
    }

    await ColorPalettes.findOneAndUpdate(
      { user, versionName },
      {
        user,
        versionName,
        colors,
        currentColor:
          typeof currentColor === 'string' ? currentColor : undefined,
        mode: typeof mode === 'string' ? mode : undefined,
      },
      { new: true, upsert: true }
    )

    res.status(200).json({ success: true, message: 'Saved' })
  } catch (error) {
    console.error('saveColorPaletteByUser error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

const deleteColorPaletteByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!ensureSelf(req, res)) return
    const { user, versionName } = req.params
    if (!user || !versionName) {
      res.status(400).send('Invalid request params')
      return
    }

    const deleted = await ColorPalettes.findOneAndDelete({ user, versionName })
    if (!deleted) {
      res.status(404).send('Not found')
      return
    }

    res.status(200).json({ success: true, message: 'Deleted' })
  } catch (error) {
    console.error('deleteColorPaletteByUser error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export {
  getAllColorPalettesByUser,
  getColorPaletteByUser,
  saveColorPaletteByUser,
  deleteColorPaletteByUser,
}
