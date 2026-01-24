import { Router, Response, Request, NextFunction } from "express"
const { body, check, validationResult } = require("express-validator")
const { sendEmailForm, sendEmailSelect } = require("../controllers/email")
import {
  getQuizzes,
  addQuiz,
  getUserQuiz,
  removeOldestDuplicate,
} from "../controllers/quiz"
import {
  getTodos,
  updateAllTodos,
  addTodo,
  deleteTodo,
  editTodo,
  clearCompletedTodos,
  editTodoOrder,
  // addOrderToAllTodos,
  // addNewFieldsToTodos,
} from "../controllers/todo"

import {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  loginUser,
  registerUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  resetPasswordToken,
  verifyEmailToken,
  verifyToken,
  generateToken,
  verifyTokenMiddleware,
  findUserByUsername,
  checkIfAdmin,
  checkIfManagement,
  authenticateUser,
  //verificationSuccess,
  requestNewToken,
  refreshExpiredToken,
  comparePassword,
  updateUsername,
  resetUsernameChange,
  confirmEmail,
  addToBlacklistedJokes,
  removeJokeFromBlacklisted,
} from "../controllers/users"
import {
  getJokes,
  addJoke,
  updateJoke,
  // deleteAllJokesByUserId,
  getJokesByUserAndCategory,
  getJokesByUserAndType,
  getJokesByUserAndSafe,
  findJokeByJokeIdLanguageCategoryType,
  getJokesByUserId,
  // getJokesByUsername,
  deleteUserFromJoke,
  verifyJoke,
} from "../controllers/jokes"
import { ELanguage, ELanguages } from "../types"
import {
  getAllBlobsByUser,
  getBlobsVersionByUser,
  saveBlobsByUser,
  deleteBlobsVersionByUser,
  editBlobsByUser,
} from "../controllers/blobs"
import {
  newOrder,
  getOrderByOrderID,
  orderConfirmation,
  getAllOrders,
  deleteOrder,
  updateOrder,
  orderChangeConfirmation,
} from "../controllers/cart"
import { EPleaseProvideAValidEmailAddress } from "../controllers/email"
import {
  addHighScore,
  getHighScoresByLevel,
  getAllHighScores,
  deleteHighScore,
  deleteHighScoresByPlayerName,
  updateHighScore,
  cleanUpHighScores,
  changePlayerName,
} from "../controllers/memory"
import { searchImages } from "../controllers/images"
import { getQuotes } from "../controllers/quotes"

const router = Router()

const validateNewOrderEmail = [
  check("info.email")
    .isEmail()
    .withMessage(
      (value: string, { req }: { req: Request }) =>
        EPleaseProvideAValidEmailAddress[
          (req.params.language as ELanguages) ?? "en"
        ]
    ),
]

router.post("/login", loginUser)

router.post("/users/forgot", forgotPassword)
router.get("/users/reset/:token", resetPassword)
router.post("/users/reset/:token", resetPasswordToken)
router.get("/users/reset-username/:token", resetUsernameChange)
//router.get('/users', [authenticateUser, checkIfAdmin, getUsers])
router.get("/users", getUsers)
router.get("/users/:id", getUser)
//router.post('/users', addUser)
router.put("/users/:id", [comparePassword, updateUser])
router.put("/users/", [comparePassword, updateUsername])
router.get("/users/:username/confirm-email/:token", confirmEmail)
router.delete("/users/:id/:deleteJokes", [authenticateUser, deleteUser])
router.post("/users/register", registerUser)
router.get("/users/verify/:token", verifyEmailToken)
router.get("/users/logout", logoutUser)
//router.get('/users/verify/:token', [verifyTokenMiddleware, verifyEmailToken])
router.post("/users/:id", generateToken)
router.get("/users/username/:username", findUserByUsername)
// router.post('/users/:id/delete', deleteAllJokesByUserId)
router.put("/users/:id/:jokeId/:language", addToBlacklistedJokes)
router.delete("/users/:id/:joke_id/:language", removeJokeFromBlacklisted)

// router.get('/users/:username/jokes', getJokesByUsername)
router.get("/users/:id/categories/:category/jokes", getJokesByUserAndCategory)
router.get("/users/:id/joketypes/:type/jokes", getJokesByUserAndType)
router.get("/users/:id/safe/:safe/jokes", getJokesByUserAndSafe)
// router.put('/users/:id/update-jokes', updateUserJokes)

//router.put('/users/request-new-token', refreshExpiredToken)

router.get("/blobs/:user/:d", getAllBlobsByUser)
router.get("/blobs/:user/:d/:versionName/:language", getBlobsVersionByUser)
router.post("/blobs/:user/:d/:versionName/:language", saveBlobsByUser)
router.delete(
  "/blobs/:user/:d/:versionName/:language",
  deleteBlobsVersionByUser
)
router.put("/blobs/:user/:d/:versionName/:language", editBlobsByUser)

router.get(
  "/jokes/:jokeId/:language/:category/:type",
  findJokeByJokeIdLanguageCategoryType
)
router.post("/jokes", addJoke)
router.put("/jokes/:id", updateJoke)
router.get("/jokes/:id/verification", verifyJoke)
router.get("/jokes", getJokes)
router.get("/jokes/user/:id/", getJokesByUserId)
router.delete("/jokes/:id/delete-user/:userId", deleteUserFromJoke)

//router.get('/quiz', getQuizzes)
router.post("/quiz", addQuiz)
router.put("/quiz", addQuiz)
router.get("/quiz/:id", getUserQuiz)
router.delete("/quiz/remove/:user", removeOldestDuplicate)

router.get("/highscores/:language", getAllHighScores)
router.post("/highscores/:language/key/:levelKey", addHighScore)
router.get("/highscores/:language/key/:levelKey", getHighScoresByLevel)
router.put("/highscores/:language/id/:id", checkIfManagement, updateHighScore)
router.delete("/highscores/:language/id/:id", deleteHighScore)
router.delete(
  "/highscores/:language/player/:playerName",
  deleteHighScoresByPlayerName
)
router.put("/highscores/:language/player", checkIfManagement, changePlayerName)
router.post("/highscores/:language/cleanup/:levelKey", cleanUpHighScores)

router.get("/images/:language", searchImages)

router.get("/quotes/:language/:category", getQuotes)

router.get("/todo/:user", getTodos)
router.put("/todo/:user", updateAllTodos)
router.post("/todo/:user", addTodo)
router.delete("/todo/:user/:key", deleteTodo)
router.put("/todo/:user/:key", editTodo)
router.delete("/todo/:user", clearCompletedTodos)
router.post("/todo/:user/order", editTodoOrder)
// router.put('/todo', addOrderToAllTodos)
// router.put('/todo/', addNewFieldsToTodos)

router.post(
  "/cart/:language",
  validateNewOrderEmail,
  newOrder,
  orderConfirmation
)
router.get("/cart/:language/:orderID", getOrderByOrderID)
router.get("/cart/:language", [checkIfManagement, getAllOrders])
router.delete("/cart/:language/:orderID", [checkIfAdmin, deleteOrder])
router.put("/cart/:language/:orderID", [
  checkIfAdmin,
  updateOrder,
  orderChangeConfirmation,
])

router.post(
  "/send-email-form",
  [
    body("firstName").trim().escape(),
    body("lastName").trim().escape(),
    body("email").isEmail(),
    body("message").trim().escape(),
    body("encouragement").trim().escape(),
    body("color").trim().escape(),
    body("dark").trim().escape(),
    body("light").trim().escape(),
    body("select").trim().escape(),
    body("selectmulti").trim().escape(),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().join("\n"),
        errors: errors.array(),
      })
    }
    next()
  },
  sendEmailForm
)

router.post(
  "/send-email-select",
  [
    body("language")
      .optional({ checkFalsy: true })
      .isIn(Object.values(ELanguage)),
    body("issues").trim().escape(),
    body("favoriteHero").trim().escape(),
    body("clarification").optional({ checkFalsy: true }).trim().escape(),
    body("email").optional({ checkFalsy: true }).trim().escape(),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors
          .array()
          .map((error: { msg: string | Object }) => {
            if (typeof error.msg === "object") {
              return JSON.stringify(error.msg)
            }
            return String(error.msg)
          })
          .join("\n"),
        errors: errors.array(),
      })
    }
    next()
  },
  sendEmailSelect
)

export default router
