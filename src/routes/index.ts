import { Router, Response, Request, NextFunction } from 'express'
const { body, check, validationResult } = require('express-validator')
const { sendEmailForm, sendEmailSelect } = require('../controllers/email')
import {
  getQuizzes,
  addQuiz,
  getUserQuiz,
  removeOldestDuplicate,
} from '../controllers/quiz'
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
} from '../controllers/todo'

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
  confirmEmail,
  addToBlacklistedJokes,
  removeJokeFromBlacklisted,
} from '../controllers/users'
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
} from '../controllers/jokes'
import { ELanguage, ELanguages } from '../types'
import {
  getAllBlobsByUser,
  getBlobsVersionByUser,
  saveBlobsByUser,
  deleteBlobsVersionByUser,
  editBlobsByUser,
} from '../controllers/blobs'
import {
  newOrder,
  getOrderByOrderID,
  orderConfirmation,
  getAllOrders,
  deleteOrder,
  updateOrder,
  orderChangeConfirmation,
} from '../controllers/cart'
import { EPleaseProvideAValidEmailAddress } from '../controllers/email'
import {
  addHighScore,
  getHighScoresByLevel,
  getAllHighScores,
  deleteHighScore,
  deleteHighScoresByPlayerName,
  updateHighScore,
  cleanUpHighScores,
  changePlayerName,
} from '../controllers/memory'
import { searchImages } from '../controllers/images'
import { getQuotes } from '../controllers/quotes'

const router = Router()

const validateNewOrderEmail = [
  check('info.email')
    .isEmail()
    .withMessage(
      (value: string, { req }: { req: Request }) =>
        EPleaseProvideAValidEmailAddress[(req.params.language as ELanguages) ?? 'en']
    ),
]

router.post('/api/login', loginUser)

router.post('/api/users/forgot', forgotPassword)
router.get('/api/users/reset/:token', resetPassword)
router.post('/api/users/reset/:token', resetPasswordToken)
//router.get('/api/users', [authenticateUser, checkIfAdmin, getUsers])
router.get('/api/users', getUsers)
router.get('/api/users/:id', getUser)
//router.post('/api/users', addUser)
router.put('/api/users/:id', [comparePassword, updateUser])
router.put('/api/users/', [comparePassword, updateUsername])
router.get('/api/users/:username/confirm-email/:token', confirmEmail)
router.delete('/api/users/:id/:deleteJokes', [authenticateUser, deleteUser])
router.post('/api/users/register', registerUser)
router.get('/api/users/verify/:token', verifyEmailToken)
router.get('/api/users/logout', logoutUser)
//router.get('/api/users/verify/:token', [verifyTokenMiddleware, verifyEmailToken])
router.post('/api/users/:id', generateToken)
router.get('/api/users/username/:username', findUserByUsername)
// router.post('/api/users/:id/delete', deleteAllJokesByUserId)
router.put('/api/users/:id/:jokeId/:language', addToBlacklistedJokes)
router.delete('/api/users/:id/:joke_id/:language', removeJokeFromBlacklisted)

// router.get('/api/users/:username/jokes', getJokesByUsername)
router.get('/api/users/:id/categories/:category/jokes', getJokesByUserAndCategory)
router.get('/api/users/:id/joketypes/:type/jokes', getJokesByUserAndType)
router.get('/api/users/:id/safe/:safe/jokes', getJokesByUserAndSafe)
// router.put('/api/users/:id/update-jokes', updateUserJokes)

//router.put('/api/users/request-new-token', refreshExpiredToken)

router.get('/api/blobs/:user/:d', getAllBlobsByUser)
router.get('/api/blobs/:user/:d/:versionName/:language', getBlobsVersionByUser)
router.post('/api/blobs/:user/:d/:versionName/:language', saveBlobsByUser)
router.delete('/api/blobs/:user/:d/:versionName/:language', deleteBlobsVersionByUser)
router.put('/api/blobs/:user/:d/:versionName/:language', editBlobsByUser)

router.get(
  '/api/jokes/:jokeId/:language/:category/:type',
  findJokeByJokeIdLanguageCategoryType
)
router.post('/api/jokes', addJoke)
router.put('/api/jokes/:id', updateJoke)
router.get('/api/jokes/:id/verification', verifyJoke)
router.get('/api/jokes', getJokes)
router.get('/api/jokes/user/:id/', getJokesByUserId)
router.delete('/api/jokes/:id/delete-user/:userId', deleteUserFromJoke)

//router.get('/api/quiz', getQuizzes)
router.post('/api/quiz', addQuiz)
router.put('/api/quiz', addQuiz)
router.get('/api/quiz/:id', getUserQuiz)
router.delete('/api/quiz/remove/:user', removeOldestDuplicate)

router.get('/api/highscores/:language', getAllHighScores)
router.post('/api/highscores/:language/key/:levelKey', checkIfManagement, addHighScore)
router.get('/api/highscores/:language/key/:levelKey', getHighScoresByLevel)
router.put('/api/highscores/:language/id/:id', checkIfManagement, updateHighScore)
router.delete('/api/highscores/:language/id/:id', deleteHighScore)
router.delete(
  '/api/highscores/:language/player/:playerName',
  deleteHighScoresByPlayerName
)
router.put('/api/highscores/:language/player', checkIfManagement, changePlayerName)
router.post('/api/highscores/:language/cleanup/:levelKey', cleanUpHighScores)

router.get('/api/images/:language', searchImages)

router.get('/api/quotes/:language/:category', getQuotes)

router.get('/api/todo/:user', getTodos)
router.put('/api/todo/:user', updateAllTodos)
router.post('/api/todo/:user', addTodo)
router.delete('/api/todo/:user/:key', deleteTodo)
router.put('/api/todo/:user/:key', editTodo)
router.delete('/api/todo/:user', clearCompletedTodos)
router.post('/api/todo/:user/order', editTodoOrder)
// router.put('/api/todo', addOrderToAllTodos)
// router.put('/api/todo/', addNewFieldsToTodos)

router.post('/api/cart/:language', validateNewOrderEmail, newOrder, orderConfirmation)
router.get('/api/cart/:language/:orderID', getOrderByOrderID)
router.get('/api/cart/:language', [checkIfManagement, getAllOrders])
router.delete('/api/cart/:language/:orderID', [checkIfAdmin, deleteOrder])
router.put('/api/cart/:language/:orderID', [
  checkIfAdmin,
  updateOrder,
  orderChangeConfirmation,
])

router.get('/', (req, res) => {
  res.send('Nothing to see here')
})

router.post(
  '/api/send-email-form',
  [
    body('firstName').trim().escape(),
    body('lastName').trim().escape(),
    body('email').isEmail(),
    body('message').trim().escape(),
    body('encouragement').trim().escape(),
    body('color').trim().escape(),
    body('dark').trim().escape(),
    body('light').trim().escape(),
    body('select').trim().escape(),
    body('selectmulti').trim().escape(),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().join('\n'),
        errors: errors.array(),
      })
    }
    next()
  },
  sendEmailForm
)

router.post(
  '/api/send-email-select',
  [
    body('language').optional({ checkFalsy: true }).isIn(Object.values(ELanguage)),
    body('issues').trim().escape(),
    body('favoriteHero').trim().escape(),
    body('clarification').optional({ checkFalsy: true }).trim().escape(),
    body('email').optional({ checkFalsy: true }).trim().escape(),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors
          .array()
          .map((error: { msg: string | Object }) => {
            if (typeof error.msg === 'object') {
              return JSON.stringify(error.msg)
            }
            return String(error.msg)
          })
          .join('\n'),
        errors: errors.array(),
      })
    }
    next()
  },
  sendEmailSelect
)

export default router
