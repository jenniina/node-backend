import { Todo } from "../../models/todo"
import { Response, Request } from "express"
import { ITodo, ITodos } from "../../types"
import mongoose from "mongoose"

const getAuthUserId = (req: Request): string | undefined => {
  const authUser = (req as unknown as { user?: { _id?: unknown } }).user
  const id = authUser?._id
  return id ? String(id) : undefined
}

const ensureSelf = (req: Request, res: Response): boolean => {
  const authUserId = getAuthUserId(req)
  const targetUserId = String(req.params.user)
  if (!authUserId || authUserId !== targetUserId) {
    res.status(403).json({ success: false, message: "Forbidden" })
    return false
  }
  return true
}

// const addNewFieldsToTodos = async () => {
//   try {
//     const todos = await Todo.find({})

//     for (let todoDocument of todos) {
//       let updatedTodos = todoDocument.todos.map((todo: ITodo): ITodo => {
//         if (!todo.priority) todo.priority = 'low'
//         if (!todo.category) todo.category = 'other'
//         if (!todo.deadline) todo.deadline = ''
//         return todo
//       })

//       await Todo.findOneAndUpdate(
//         { _id: todoDocument._id },
//         { $set: { todos: updatedTodos } },
//         { new: true, useFindAndModify: false }
//       )
//       console.log('Updated todoDocument: ', todoDocument)
//     }

//     console.log('New fields added to all todos')
//   } catch (error) {
//     console.error('Error adding new fields to todos:', error)
//   }
// }

const getTodos = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const { user } = req.params
    const todoDocument = await Todo.findOne({ user })
    if (!todoDocument) {
      const newTodo = new Todo({ user, todos: [] })
      const savedTodoDocument = await newTodo.save()
      return res.json(savedTodoDocument.todos)
    }
    res.json(todoDocument?.todos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const updateAllTodos = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const { user } = req.params
    const newTodos: ITodo[] = req.body
    let todoDocument = await Todo.findOne({ user })
    if (!todoDocument) {
      const newTodo = new Todo({ user, todos: newTodos })
      const savedTodoDocument = await newTodo.save()
      return res.json(savedTodoDocument.todos)
    } else {
      // Replace existing todos with newTodos
      todoDocument.todos = newTodos
      const updatedTodoDocument = await todoDocument.save()
      return res.json(updatedTodoDocument.todos)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const addTodo = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const { user } = req.params
    const todoDocument = await Todo.findOne({ user })
    if (!todoDocument) {
      return res
        .status(404)
        .json({ success: false, message: "No todos found for this user" })
    }
    const { complete, name, key, priority, category, deadline } = req.body

    if (complete === undefined || name === undefined || key === undefined) {
      return res.status(400).json({
        success: false,
        message: "Task must include complete, name, and key fields",
      })
    }

    let newOrder: number

    if (priority === "high") {
      newOrder = 0
    } else {
      const maxOrder =
        todoDocument.todos.length > 0
          ? Math.max(...todoDocument.todos.map((todo: ITodo) => todo.order))
          : 0
      newOrder = maxOrder + 1
    }

    const newTodo = {
      complete,
      name,
      key,
      order: newOrder,
      priority,
      category,
      deadline,
    }
    const updatedTodoDocument = await Todo.findOneAndUpdate(
      { user },
      { $push: { todos: newTodo } },
      { new: true, useFindAndModify: false }
    )
    if (!updatedTodoDocument) {
      return res
        .status(404)
        .json({ success: false, message: "No todos found for this user" })
    }
    const addedTodo = updatedTodoDocument.todos.find(
      (todo: ITodo) => todo.key === key
    )

    const sortedTodos: ITodo[] = todoDocument.todos.sort(
      (a: ITodo, b: ITodo) => a.order - b.order
    )

    sortedTodos.forEach((todo: ITodo, index: number) => {
      todo.order = index + 1
    })

    await todoDocument.save()

    res.json(addedTodo)
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const deleteTodo = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const { user, key } = req.params
    // console.log('deleteTodo user: ', user)
    const updatedTodoDocument = await Todo.findOneAndUpdate(
      { user },
      { $pull: { todos: { key: key } } },
      { new: true, useFindAndModify: false }
    )
    if (!updatedTodoDocument) {
      return res
        .status(404)
        .json({ success: false, message: "No todos found for this user" })
    }

    // Sort the todos by the original order
    updatedTodoDocument.todos.sort((a: ITodo, b: ITodo) => a.order - b.order)

    // Reassign the order values of the remaining todos
    updatedTodoDocument.todos.forEach((todo: ITodo, index: number) => {
      todo.order = index + 1
    })

    await updatedTodoDocument.save()

    res.json(updatedTodoDocument)
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const clearCompletedTodos = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    // console.log('user: ', req.params.user)
    const { user } = req.params
    //const userId = new mongoose.Types.ObjectId(user)
    const updatedTodoDocument = await Todo.findOneAndUpdate(
      { user },
      { $pull: { todos: { complete: true } } },
      { new: true, useFindAndModify: false }
    )
    // console.log('updatedTodoDocument: ', updatedTodoDocument)
    if (!updatedTodoDocument) {
      return res
        .status(404)
        .json({ success: false, message: "No todos found for this user" })
    }
    res.json(updatedTodoDocument)
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const editTodo = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const { user, key } = req.params
    const todoDocument = await Todo.findOneAndUpdate(
      { user, "todos.key": key },
      {
        $set: {
          "todos.$.complete": req.body.complete,
          "todos.$.name": req.body.name,
          "todos.$.priority": req.body.priority,
          "todos.$.category": req.body.category,
          "todos.$.deadline": req.body.deadline,
        },
      },
      { new: true }
    )
    if (!todoDocument) {
      return res
        .status(404)
        .json({ success: false, message: "No todos found for this user" })
    }
    //return the updated todo
    const updatedTodo: ITodos = todoDocument.todos.find(
      (todo: ITodo) => todo.key === key
    )
    res.json(updatedTodo)
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

const editTodoOrder = async (req: Request, res: Response) => {
  try {
    if (!ensureSelf(req, res)) return
    const { user } = req.params
    const todosWithNewOrder = req.body.todos // This should be an array of objects with keys: { key, order }

    if (!todosWithNewOrder || !Array.isArray(todosWithNewOrder)) {
      return res.status(400).json({
        success: false,
        message: "Todos field is required and it should be an array",
      })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    for (const todo of todosWithNewOrder) {
      const { key, order } = todo
      const updatedTodoDocument = await Todo.findOneAndUpdate(
        { user, "todos.key": key },
        { $set: { "todos.$.order": order } },
        { new: true, session }
      )
      if (!updatedTodoDocument) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({
          success: false,
          message: `No todo found for this user with key: ${key}`,
        })
      }
    }

    await session.commitTransaction()
    session.endSession()

    const updatedTodos = await Todo.findOne({ user })
    res.json(updatedTodos)
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: `Internal server error. ${(error as Error).message}`,
    })
  }
}

// const addOrderToAllTodos = async (req: Request, res: Response) => {
//   try {
//     const todos = await Todo.find({})

//     for (let todoDocument of todos) {
//       let order = 0
//       for (let todo of todoDocument.todos) {
//         todo.order = order++
//       }
//       await todoDocument.save()
//     }

//     res.json({ message: 'Order added to all todos' })
//   } catch (error) {
//     console.error(error)
//   }
// }

export {
  getTodos,
  updateAllTodos,
  addTodo,
  deleteTodo,
  editTodo,
  clearCompletedTodos,
  editTodoOrder,
  // addOrderToAllTodos,
  // addNewFieldsToTodos,
}
