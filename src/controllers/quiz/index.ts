import { Response, Request } from "express"
import { Quiz } from "../../models/quiz"
import { IQuiz } from "../../types"

const getAuthUserId = (req: Request): string | undefined => {
  const authUser = (req as unknown as { user?: { _id?: unknown } }).user
  const id = authUser?._id
  return id ? String(id) : undefined
}

const ensureSelf = (
  req: Request,
  res: Response,
  targetUserId: string
): boolean => {
  const authUserId = getAuthUserId(req)
  if (!authUserId || authUserId !== String(targetUserId)) {
    res.status(403).json({ success: false, message: "Forbidden" })
    return false
  }
  return true
}

const getQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const quizzes = await Quiz.find()
    res.status(200).json({ quizzes })
  } catch (error) {
    throw error
  }
}

const getUserQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    if (!ensureSelf(req, res, id)) return
    const quiz = await Quiz.findOne({ user: id })
    res.status(200).json(quiz)
  } catch (error) {
    throw error
  }
}

// const addQuiz = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const body = req.body as Pick<IQuiz, 'highscores' | 'user'>

//     const existingQuiz = (await Quiz.findOne({
//       user: body.user,
//     })) as IQuiz

//     if (!existingQuiz) {
//       const quiz = new Quiz({
//         highscores: body.highscores,
//         user: body.user,
//       }) as IQuiz

//       const newQuiz: IQuiz = await quiz.save()

//       res.status(201).json({ message: 'Quiz added', quiz: newQuiz })
//     } else if (!body.user) {
//       res.status(400).json({ message: 'type and user fields are required' })
//     } else {
//       existingQuiz.highscores = body.highscores
//       existingQuiz.user = body.user
//       try {
//         const updatedQuiz: IQuiz = await existingQuiz.save()
//         res.status(200).json({ message: 'Quiz updated', quiz: updatedQuiz })
//       } catch (validationError) {
//         console.error(validationError)
//         res.status(400).json({ message: 'Quiz not updated', error: validationError })
//       }
//     }
//   } catch (error) {
//     throw error
//   }
// }

const addQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Pick<IQuiz, "highscores" | "user">

    if (!body.user) {
      res
        .status(400)
        .json({ success: false, message: "user field is required" })
      return
    }

    if (!ensureSelf(req, res, String(body.user))) return

    const existingQuiz = await Quiz.findOne({
      user: body.user,
    })

    if (!existingQuiz) {
      const quiz = new Quiz({
        highscores: body.highscores,
        user: body.user,
      }) as IQuiz

      const newQuiz: IQuiz = await quiz.save()
      res
        .status(201)
        .json({ success: true, message: "Quiz added", quiz: newQuiz })
    } else {
      existingQuiz.highscores = body.highscores
      try {
        const updatedQuiz = (await existingQuiz.save()) as IQuiz
        res
          .status(200)
          .json({ success: true, message: "Quiz updated", quiz: updatedQuiz })
      } catch (validationError) {
        console.error(validationError)
        res
          .status(400)
          .json({
            success: false,
            message: "Quiz not updated",
            error: validationError,
          })
      }
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const removeOldestDuplicate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user } = req.params as Pick<IQuiz, "user">

    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "user field is required" })
      return
    }

    if (!ensureSelf(req, res, String(user))) return

    const existingQuiz = await Quiz.find({
      user: user,
    }).sort({ createdAt: 1 })

    if (existingQuiz.length > 1) {
      const oldestQuiz = existingQuiz[0]
      await Quiz.deleteOne({ _id: oldestQuiz._id })
      res
        .status(200)
        .json({ success: true, message: "Quiz deleted", quiz: oldestQuiz })
    } else {
      res.status(200).json({ success: true, message: "No duplicate found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// const updateQuiz = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       params: { id },
//       body,
//     } = req
//     // const updateQuiz: IQuiz | null = await Quiz.findByIdAndUpdate({ _id: id }, body)
//     // const allQuiz: IQuiz[] = await Quiz.find()
//     // res.status(200).json({
//     //   message: 'Quiz updated',
//     //   quiz: updateQuiz,
//     //   quizzes: allQuiz,
//     // })

//     const quiz = await Quiz.findOneAndUpdate({ user: body.user, type: body.type })
//     if (!quiz) {
//       throw new Error('Quiz not found')
//     }
//     quiz.highscores = body.highscores
//     await quiz.save()
//     console.log(quiz)
//     res.status(200).json({ message: 'Quiz updated', quiz })
//   } catch (error) {
//     throw error
//   }
// }

export { getQuizzes, getUserQuiz, addQuiz, removeOldestDuplicate }
