import e, { Response, Request } from "express"
import {
  IJoke,
  EJokeType,
  EEmailSentToAdministratorPleaseWaitForApproval,
  EJokeUpdated,
  EUserDeletedFromJoke,
} from "../../types"
import { Joke } from "../../models/joke"
import { sendMail, EEmailSent, EErrorSendingMail } from "../email"
import { User } from "../../models/user"

enum ELanguage {
  en = "en",
  es = "es",
  fr = "fr",
  de = "de",
  pt = "pt",
  cs = "cs",
  fi = "fi",
}
enum EError {
  en = "An error occurred",
  es = "Ha ocurrido un error",
  fr = "Une erreur est survenue",
  de = "Ein Fehler ist aufgetreten",
  pt = "Ocorreu um erro",
  cs = "Došlo k chybě",
  fi = "Tapahtui virhe",
}

enum EAnErrorOccurredAddingTheJoke {
  en = "An error occurred adding the joke",
  es = "Ha ocurrido un error al agregar la broma",
  fr = "Une erreur s'est produite lors de l'ajout de la blague",
  de = "Beim Hinzufügen des Witzes ist ein Fehler aufgetreten",
  pt = "Ocorreu um erro ao adicionar a piada",
  cs = "Při přidávání vtipu došlo k chybě",
  fi = "Vitsiä lisättäessä tapahtui virhe",
}
enum EJokeAdded {
  en = "Joke added",
  es = "Broma agregada",
  fr = "Blague ajoutée",
  de = "Witz hinzugefügt",
  pt = "Piada adicionada",
  cs = "Vtip přidán",
  fi = "Vitsi lisätty",
}

const getJokes = async (req: Request, res: Response): Promise<void> => {
  try {
    const jokes: IJoke[] = await Joke.find()
    res.status(200).json(jokes)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error,
    })
    console.error("Error:", error)
  }
}

const mapToJoke = (doc: any): IJoke => {
  return {
    jokeId: doc.jokeId,
    type: doc.type,
    category: doc.category,
    subCategories: doc.subCategories,
    language: doc.language,
    safe: doc.safe,
    flags: doc.flags,
    user: doc.user,
    private: doc.private ?? undefined,
    verified: doc.verified ?? undefined,
    anonymous: doc.anonymous ?? undefined,
    author: doc.author ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    ...(doc.type === EJokeType.single
      ? { joke: doc.joke }
      : { setup: doc.setup, delivery: doc.delivery }),
  }
}

const addJoke = async (req: Request, res: Response): Promise<void> => {
  //Joke.collection.dropIndex('_id')
  try {
    const body = req.body as Pick<
      IJoke,
      | "jokeId"
      | "type"
      | "category"
      | "subCategories"
      | "user"
      | "language"
      | "safe"
      | "flags"
      | "private"
      | "verified"
      | "anonymous"
      | "author"
    >

    // let joke: IJoke

    // // Check if a joke already exists
    // const existingJoke = await (body &&
    //   Joke.findOne({
    //     jokeId: body.jokeId,
    //     type: body.type,
    //     category: body.category,
    //     language: body.language,
    //   }))

    // if (existingJoke) {
    //   // Check if the user ID already exists in the user array
    //   if (!existingJoke.user.includes(req.body.user)) {
    //     existingJoke.user.push(req.body.user[0])
    //     await existingJoke.save()
    //   }
    //   joke = mapToJoke(existingJoke)
    // } else {
    //   if (req.body.type === EJokeType.single) {
    //     const savedJoke = await new Joke({
    //       jokeId: body.jokeId,
    //       joke: req.body.joke,
    //       category: body.category,
    //       type: body.type,
    //       safe: req.body.safe,
    //       user: body.user,
    //       language: body.language,
    //     }).save()

    //     joke = mapToJoke(savedJoke)
    //   } else {
    //     const savedJoke = await new Joke({
    //       jokeId: body.jokeId,
    //       setup: req.body.setup,
    //       delivery: req.body.delivery,
    //       category: body.category,
    //       type: body.type,
    //       safe: req.body.safe,
    //       user: body.user,
    //       language: body.language,
    //     }).save()

    //     joke = mapToJoke(savedJoke)
    //   }
    // }

    const filter = {
      jokeId: body.jokeId.toString(),
      type: body.type,
      category: body.category,
      language: body.language,
    }

    const update =
      req.body.type === EJokeType.single
        ? {
            $setOnInsert: {
              jokeId: body.jokeId.toString(),
              joke: req.body.joke,
              category: body.category,
              subCategories: body.subCategories,
              type: body.type,
              safe: req.body.safe,
              flags: req.body.flags,
              private: req.body.private ?? undefined,
              verified: req.body.verified ?? undefined,
              anonymous: req.body.anonymous ?? undefined,
              author: req.body.author ?? undefined,
              language: body.language,
            },
            $addToSet: { user: { $each: body.user } },
          }
        : {
            $setOnInsert: {
              jokeId: body.jokeId.toString(),
              setup: req.body.setup,
              delivery: req.body.delivery,
              category: body.category,
              subCategories: body.subCategories,
              type: body.type,
              safe: req.body.safe,
              flags: req.body.flags,
              private: req.body.private ?? undefined,
              verified: req.body.verified ?? undefined,
              anonymous: req.body.anonymous ?? undefined,
              author: req.body.author ?? undefined,
              language: body.language,
            },
            $addToSet: { user: { $each: body.user } },
          }

    const joke = (await Joke.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    })) as IJoke

    //Object.values(joke.flags).some(Boolean)
    if (joke.private === false) {
      const author = await User.findOne({ _id: req.body.author })
      const subject = "A joke needs verification"
      const message = ` ${author?.username}: ${author?.name}: ${joke.user}, ${
        joke._id
      }, ${joke.type}, ${joke.category}, ${joke.language}, ${
        joke.safe
      }, ${Object.entries(joke.flags)
        .filter(([key, value]) => value)
        .map(([key, value]) => key)
        .join(", ")}, ${
        joke.type === EJokeType.twopart && joke.setup ? joke.setup : ""
      }, ${
        joke.type === EJokeType.twopart && joke.delivery ? joke.delivery : ""
      }, ${joke.type === EJokeType.single && joke.joke ? joke.joke : ""}`
      const adminEmail = process.env.NODEMAILER_USER || ""
      const link = `${process.env.BASE_URI}/api/jokes/${joke._id}/verification`
      const language = (joke.language as ELanguage) ?? "en"

      try {
        const mailResponse = await sendMail(subject, message, adminEmail, link)
        // console.log(EEmailSent[joke.language as ELanguage], mailResponse)
        res.status(201).json({
          success: true,
          message:
            EEmailSentToAdministratorPleaseWaitForApproval[
              joke.language as keyof typeof EEmailSentToAdministratorPleaseWaitForApproval
            ],
          joke,
        })
      } catch (error) {
        console.error(EErrorSendingMail[joke.language as ELanguage], error)
        res.status(500).json({
          success: false,
          message:
            EErrorSendingMail[joke.language as keyof typeof EErrorSendingMail],
          error,
        })
      }
      // sendMail(subject, message, adminEmail, language, link)
      //   .then((response) => {
      //     console.log(EEmailSent[joke.language as ELanguage], response)
      //     res.status(201).json({
      //       success: true,
      //       message:
      //         EEmailSentToAdministratorPleaseWaitForApproval[
      //           joke.language as keyof typeof EEmailSentToAdministratorPleaseWaitForApproval
      //         ],
      //       joke,
      //     })
      //   })
      //   .catch((error) => {
      //     console.error(EErrorSendingMail[joke.language as ELanguage], error)
      //     res.status(500).json({
      //       success: false,
      //       message: EErrorSendingMail[joke.language as keyof typeof EErrorSendingMail],
      //       error,
      //     })
      //   })
    }

    // const existingJoke = await Joke.findOne(filter)

    // let joke

    // if (existingJoke) {
    //   // If the joke exists, update the user array
    //   existingJoke.user = [...new Set([...existingJoke.user, ...body.user])]
    //   joke = await existingJoke.save()
    // } else {
    //   // If the joke doesn't exist, create a new joke
    //   const jokeData =
    //     req.body.type === EJokeType.single
    //       ? {
    //           jokeId: body.jokeId,
    //           joke: req.body.joke,
    //           category: body.category,
    //           type: body.type,
    //           safe: req.body.safe,
    //           user: body.user,
    //           language: body.language,
    //         }
    //       : {
    //           jokeId: body.jokeId,
    //           setup: req.body.setup,
    //           delivery: req.body.delivery,
    //           category: body.category,
    //           type: body.type,
    //           safe: req.body.safe,
    //           user: body.user,
    //           language: body.language,
    //         }

    //   joke = await new Joke(jokeData).save()
    // }
    else {
      res.status(201).json({
        success: true,
        message: EJokeAdded[joke.language as ELanguage],
        joke,
      })
    }
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({
      success: false,
      message:
        EAnErrorOccurredAddingTheJoke[req.body.language as ELanguage] ||
        "An error occurred adding the joke",
      error,
    })
  }
}

const verifyJoke = async (req: Request, res: Response): Promise<void> => {
  enum EYourJokeHasBeenVerified {
    en = "Your joke has been verified",
    es = "Tu broma ha sido verificada",
    fr = "Votre blague a été vérifiée",
    de = "Dein Witz wurde überprüft",
    pt = "Sua piada foi verificada",
    cs = "Váš vtip byl ověřen",
    fi = "Vitsisi on vahvistettu",
  }
  try {
    const joke: IJoke | null = await Joke.findOneAndUpdate(
      { _id: req.params.id },
      { verified: true, private: false }
    )
    const subject = EYourJokeHasBeenVerified[joke?.language as ELanguage]
    const message = `${joke?.category}, ${
      joke?.type === EJokeType.twopart ? `${joke?.setup} ${joke?.delivery}` : ""
    } - ${joke?.type === EJokeType.single ? joke?.joke : ""}`
    const author = joke?.author || ""
    const recipient = await User.findOne({ _id: author })
    const username = recipient?.username || ""
    const link = `${process.env.SITE_URL}/portfolio/jokes?login=login`
    const language = (joke?.language as ELanguage) ?? "en"
    sendMail(subject, message, username, link)
      .then((response) => {
        console.log(EEmailSent[joke?.language as ELanguage], response)
        res.status(201).json({
          success: true,
          message: EEmailSent[language],
          joke,
        })
        return
      })
      .catch((error) => {
        console.error(EErrorSendingMail[joke?.language as ELanguage], error)
        res.status(500).json({
          success: false,
          message:
            EErrorSendingMail[joke?.language as keyof typeof EErrorSendingMail],
          error,
        })
      })
    //res.status(200).json({ message: 'Joke verified', joke })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `An error occurred: ${(error as Error)?.message} ${
        error as Error
      }`,
      error,
    })
    console.error("Error:", error)
  }
}

const updateJoke = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      // params: { _id },
      body,
    } = req

    const { _id, ...updateFields } = body

    const language = body.language as ELanguage

    const findJoke = await Joke.findOne({ _id: body._id })
    if (findJoke?.private === true && body.private === false) {
      // const subject = 'A joke needs verification'
      // const message = `${body.jokeId}, ${body.type}, ${body.category}, ${
      //   body.language
      // }, ${body.safe}, ${Object.entries(body.flags)
      //   .filter(([key, value]) => value)
      //   .map(([key, value]) => key)
      //   .join(', ')}, ${body.user}, ${body.setup ? body.setup : ''}, ${
      //   body.delivery ? body.delivery : ''
      // }, ${body.body ? body.joke : ''}`
      // const adminEmail = process.env.NODEMAILER_USER || ''
      // const link = `${process.env.BASE_URI}/api/jokes/${body.jokeId}/verification`

      // sendMail(subject, message, adminEmail, body.language, link)
      //   .then((response) => console.log(EEmailSent[body.language as ELanguage], response))
      //   .catch((error) =>
      //     console.error(EErrorSendingMail[body.language as ELanguage], error)
      //   )
      const author = await User.findOne({ _id: req.body.author })
      const subject = "A joke needs verification"
      const message = `${author?.username}: ${author?.name}: ${body.user}, ${
        body.jokeId
      }, ${findJoke._id}, ${body.type}, ${body.category}, ${body.language}, ${
        body.safe
      }, ${Object.entries(body.flags)
        .filter(([key, value]) => value)
        .map(([key, value]) => key)
        .join(", ")}, ${
        body.type === EJokeType.twopart && body.setup ? body.setup : ""
      }, ${
        body.type === EJokeType.twopart && body.delivery ? body.delivery : ""
      }, ${body.type === EJokeType.single && body.body ? body.body : ""}`
      const adminEmail = process.env.NODEMAILER_USER || ""
      const link = `${process.env.BASE_URI}/api/jokes/${findJoke._id}/verification`

      // sendMail(subject, message, adminEmail, language, link)
      //   .then((response) => {
      //     console.log(EEmailSent[body.language as ELanguage], response)
      //     res.status(201).json({
      //       success: true,
      //       message:
      //         EEmailSentToAdministratorPleaseWaitForApproval[
      //           body.language as keyof typeof EEmailSentToAdministratorPleaseWaitForApproval
      //         ],
      //       joke,
      //     })
      //   })
      //   .catch((error) => {
      //     console.error(EErrorSendingMail[language as ELanguage], error)
      //     res.status(500).json({
      //       success: false,
      //       message: EErrorSendingMail[language as keyof typeof EErrorSendingMail],
      //       error,
      //     })
      //   })
      try {
        await sendMail(subject, message, adminEmail, link)

        res.status(201).json({
          success: true,
          message:
            EEmailSentToAdministratorPleaseWaitForApproval[
              body.language as keyof typeof EEmailSentToAdministratorPleaseWaitForApproval
            ],
          body,
        })
      } catch (error) {
        console.error(EErrorSendingMail[body.language as ELanguage], error)
        res.status(500).json({
          success: false,
          message:
            EErrorSendingMail[body.language as keyof typeof EErrorSendingMail],
          error,
        })
      }
      return
    } else {
      const updateJoke: IJoke | null = await Joke.findOneAndUpdate(
        { _id: body._id },
        updateFields,
        { upsert: false }
      )
      //joke = mapToJoke(updateJoke)

      res.status(200).json({
        success: true,
        message: EJokeUpdated[language as ELanguage],
        updateJoke,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: EError[req.params.language as ELanguage] || "An error occurred",
      error,
    })
    console.error("Error:", error)
  }
}

const deleteUserFromJoke = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      params: { id: _id, userId },
    } = req

    const joke: IJoke | null = await Joke.findOne({ _id: _id })
    const userIndex = joke?.user.indexOf(userId)

    if (userIndex !== undefined && userIndex !== -1) {
      joke?.user.splice(userIndex, 1)
      await (joke as any).save()
    }
    if (joke?.user.length === 0) {
      await Joke.findOneAndDelete({ _id: _id })
    }

    res.status(200).json({
      success: true,
      message: EUserDeletedFromJoke[(joke?.language as ELanguage) ?? "en"],
      joke,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: EError[req.params.lang as ELanguage] || "An error occurred",
      error,
    })
    console.error("Error:", error)
  }
}

// const deleteUserFromJokeAndDeleteJokeIfUserArrayEmpty = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const {
//       params: { id: _id, userId },
//     } = req

//     const joke: IJoke | null = await Joke.findOne({ _id: _id })
//     const userIndex = joke?.user.indexOf(userId)

//     if (userIndex !== undefined && userIndex !== -1) {
//       joke?.user.splice(userIndex, 1)
//       await joke?.save()
//     }

//     res.status(200).json({ message: 'User deleted from joke', joke })
//   } catch (error) {
//     console.error('Error:', error)
//     res.status(500).json({ message: EError[language as ELanguage] })
//   }
// }

const findJokeByJokeIdLanguageCategoryType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const joke: IJoke | null = await Joke.findOne({
      jokeId: req.params.jokeId,
      category: req.params.category,
      language: req.params.language,
      type: req.params.type,
    })
    res.status(200).json(joke)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: EError[req.params.language as ELanguage] || "An error occurred",
      error,
    })
    console.error("Error:", error)
  }
}

// const getJokesByUsername = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const jokes: IJoke[] | null = await Joke.findOne({ user: req.params.username })
//     res.status(200).json({ jokes })
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: EError[language as ELanguage] || 'An error occurred' })
//     console.error('Error:', error)
//   }
// }
const getJokesByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const jokes: IJoke[] = await Joke.find({ user: { $in: [req.params.id] } })
    res.status(200).json(jokes)
  } catch (error) {
    throw error
  }
}
const getJokesByUserAndCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const jokes: IJoke[] | null = await Joke.findOne({
      user: req.params.id,
      category: req.params.category,
    })
    res.status(200).json(jokes)
  } catch (error) {
    res.status(500).json({
      success: false,
      message: EError[req.params.language as ELanguage] || "An error occurred",
      error,
    })
    console.error("Error:", error)
  }
}

const getJokesByUserAndType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const jokes: IJoke[] | null = await Joke.findOne({
      user: req.params.id,
      type: req.params.type,
    })
    res.status(200).json({ jokes })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: EError[req.params.language as ELanguage] || "An error occurred",
      error,
    })
    console.error("Error:", error)
  }
}

const getJokesByUserAndSafe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const jokes: IJoke[] | null = await Joke.findOne({
      user: req.params.id,
      safe: req.params.safe,
    })
    res.status(200).json({ jokes })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: EError[req.params.language as ELanguage] || "An error occurred",
      error,
    })
    console.error("Error:", error)
  }
}

export {
  getJokes,
  addJoke,
  updateJoke,
  findJokeByJokeIdLanguageCategoryType,
  getJokesByUserId,
  getJokesByUserAndCategory,
  getJokesByUserAndType,
  getJokesByUserAndSafe,
  deleteUserFromJoke,
  verifyJoke,
}
