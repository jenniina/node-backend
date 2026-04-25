import { Request, Response } from 'express'
import { EError, ELanguage } from '../../types'
import { Blobs } from '../../models/blobs'
import {
  EBlobsSavedSuccessfully,
  EErrorSavingData,
  ECouldNotFindDataWithThisName,
} from '../../types'

const SINGLE_CANVAS_D = 0

const shouldUseSingleCanvas = (d: string) => Number(d) === SINGLE_CANVAS_D

const newestFirstSort = { updatedAt: -1 as const, createdAt: -1 as const }

const normalizeBlobDocument = <
  T extends {
    toObject?: () => T
    d?: number
    variant?: number
  },
>(
  blob: T
) => {
  const normalized = blob.toObject ? blob.toObject() : blob
  return {
    ...normalized,
    d: SINGLE_CANVAS_D,
    variant: normalized.variant ?? normalized.d ?? SINGLE_CANVAS_D,
  }
}

const handleError = (res: Response, error: any, language: ELanguage) => {
  console.error(error)
  res.status(500).send(`${EError[language]}: ${(error as Error).message}`)
}

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

export const getAllBlobsByUser = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const {
      params: { user, d },
      query: { language },
    } = req

    if (!user || !d || !language) {
      return res
        .status(400)
        .send(
          `'Invalid request params': user: ${user}, d: ${d} language: ${language}`
        )
    }

    const blobs = shouldUseSingleCanvas(String(d))
      ? await Blobs.find({ user }).sort(newestFirstSort)
      : await Blobs.find({ user, d }).sort(newestFirstSort)
    if (!blobs) {
      return res
        .status(404)
        .send(ECouldNotFindDataWithThisName[language as ELanguage])
    }
    res
      .status(200)
      .send(
        shouldUseSingleCanvas(String(d))
          ? blobs.map((blob) => normalizeBlobDocument(blob))
          : blobs
      )
  } catch (error) {
    handleError(res, error, req.params.language as ELanguage)
  }
}

export const getBlobsVersionByUser = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const {
      params: { user, d, versionName, language },
    } = req

    if (!user || !d || !versionName || !language) {
      return res
        .status(400)
        .send(
          `'Invalid request params': user: ${user}, d: ${d}, versionName: ${versionName}, language: ${language}`
        )
    }

    const blobs =
      (await Blobs.findOne({ user, d, versionName }).sort({
        d: 1,
        versionName: 1,
      })) ||
      (shouldUseSingleCanvas(String(d))
        ? await Blobs.findOne({ user, versionName }).sort({
            d: 1,
            versionName: 1,
          })
        : null)
    if (!blobs) {
      return res
        .status(404)
        .send(ECouldNotFindDataWithThisName[language as ELanguage])
    }
    res
      .status(200)
      .send(
        shouldUseSingleCanvas(String(d)) ? normalizeBlobDocument(blobs) : blobs
      )
  } catch (error) {
    handleError(res, error, req.body.language)
  }
}

export const saveBlobsByUser = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const {
      params: { user, d, versionName, language },
    } = req
    const { draggables, backgroundColor, variant } = req.body

    if (
      !user ||
      !versionName ||
      !d ||
      !draggables ||
      !backgroundColor ||
      !language
    ) {
      return res
        .status(400)
        .send(
          `'Invalid request params or body': user: ${user}, versionName: ${versionName}, d: ${d}, draggables: ${draggables}, backgroundColor: ${backgroundColor.join(
            ', '
          )}, language: ${language}`
        )
    }

    await Blobs.findOneAndUpdate(
      { user, versionName },
      {
        user,
        d,
        variant: Number.isFinite(Number(variant)) ? Number(variant) : Number(d),
        draggables,
        backgroundColor,
        versionName,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    )

    res.status(200).send(EBlobsSavedSuccessfully[language as ELanguage])
  } catch (error) {
    handleError(res, error, req.params.language as ELanguage)
  }
}

export const editBlobsByUser = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const {
      params: { d, user, versionName, language },
    } = req
    const { draggables, backgroundColor, newVersionName, variant } = req.body

    if (
      !user ||
      !versionName ||
      !d ||
      !draggables ||
      !backgroundColor ||
      !language
    ) {
      return res
        .status(400)
        .send(
          `'Invalid request params or body': user: ${user}, versionName: ${versionName}, d: ${d}, draggables: ${draggables}, backgroundColor: ${backgroundColor.join(
            ', '
          )}, language: ${language}`
        )
    }

    const query = shouldUseSingleCanvas(String(d))
      ? { user, versionName }
      : { user, d, versionName }

    const updatedBlob = await Blobs.findOneAndUpdate(
      query,
      {
        user,
        d: shouldUseSingleCanvas(String(d)) ? SINGLE_CANVAS_D : d,
        variant: Number.isFinite(Number(variant)) ? Number(variant) : Number(d),
        draggables,
        backgroundColor,
        versionName: newVersionName || versionName,
        updatedAt: new Date(),
      },
      { new: true }
    )

    if (!updatedBlob) {
      return res.status(404).send('Blob not found')
    }

    res.status(200).send(EBlobsSavedSuccessfully[language as ELanguage])
  } catch (error) {
    handleError(res, error, req.params.language as ELanguage)
  }
}

export const deleteBlobsVersionByUser = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const {
      params: { user, d, versionName, language },
    } = req

    if (!user || !d || !versionName || !language) {
      return res
        .status(400)
        .send(
          `'Invalid request params': user: ${user}, d: ${d}, versionName: ${versionName}, language: ${language}`
        )
    }

    const blobs = await Blobs.findOneAndDelete(
      shouldUseSingleCanvas(String(d))
        ? { user, versionName }
        : { user, d, versionName }
    )
    if (!blobs) {
      return res
        .status(404)
        .send(ECouldNotFindDataWithThisName[language as ELanguage])
    }
    res.status(200).send(EBlobsSavedSuccessfully[language as ELanguage])
  } catch (error) {
    handleError(res, error, req.params.language as ELanguage)
  }
}
