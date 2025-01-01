# A Node.js Application for a React Frontend

This is a Node.js application serving a React frontend. The app includes various features such as user authentication, quiz management, todo management, joke management, and more. It provides a RESTful API for the frontend to interact with. The app was deployed as an Azure container app, but has now been moved to a hosting service. The frontend is deployed as a static web app on Azure. The app uses a MongoDB database to store data.

## Features

- User Authentication
  - Login, Register, Logout
  - Password Reset
  - Email Verification
- Quiz Management
  - Add, Update, Delete Quizzes
- Todo Management
  - Add, Update, Delete Todos
  - Clear Completed Todos
- Joke Management
  - Add, Update, Delete Jokes
  - Verify Jokes
- High Scores Management
  - Add, Update, Delete High Scores
- Image Search
- Quotes Retrieval
- Email Sending

## License

All rights reserved.

## REST API

The app provides a RESTful API with the following endpoints:

### User Endpoints

| Method | Endpoint                                    | Description                  |
| ------ | ------------------------------------------- | ---------------------------- |
| POST   | `/api/login`                                | Login a user                 |
| POST   | `/api/users/forgot`                         | Request password reset       |
| GET    | `/api/users/reset/:token`                   | Reset password               |
| POST   | `/api/users/reset/:token`                   | Submit new password          |
| GET    | `/api/users`                                | Get all users                |
| GET    | `/api/users/:id`                            | Get a user by ID             |
| PUT    | `/api/users/:id`                            | Update a user by ID          |
| PUT    | `/api/users/`                               | Update username              |
| GET    | `/api/users/:username/confirm-email/:token` | Confirm email                |
| DELETE | `/api/users/:id/:deleteJokes`               | Delete a user by ID          |
| POST   | `/api/users/register`                       | Register a new user          |
| GET    | `/api/users/verify/:token`                  | Verify email token           |
| GET    | `/api/users/logout`                         | Logout a user                |
| POST   | `/api/users/:id`                            | Generate a new token         |
| GET    | `/api/users/username/:username`             | Find a user by username      |
| PUT    | `/api/users/:id/:jokeId/:language`          | Add a joke to blacklist      |
| DELETE | `/api/users/:id/:joke_id/:language`         | Remove a joke from blacklist |

### Quiz Endpoints

| Method | Endpoint                 | Description                      |
| ------ | ------------------------ | -------------------------------- |
| POST   | `/api/quiz`              | Add a new quiz                   |
| PUT    | `/api/quiz`              | Update a quiz                    |
| GET    | `/api/quiz/:id`          | Get a quiz by ID                 |
| DELETE | `/api/quiz/remove/:user` | Remove the oldest duplicate quiz |

### Todo Endpoints

| Method | Endpoint                | Description                 |
| ------ | ----------------------- | --------------------------- |
| GET    | `/api/todo/:user`       | Get todos for a user        |
| PUT    | `/api/todo/:user`       | Update all todos for a user |
| POST   | `/api/todo/:user`       | Add a new todo              |
| DELETE | `/api/todo/:user/:key`  | Delete a todo by key        |
| PUT    | `/api/todo/:user/:key`  | Edit a todo by key          |
| DELETE | `/api/todo/:user`       | Clear completed todos       |
| POST   | `/api/todo/:user/order` | Edit todo order             |

### Joke Endpoints

| Method | Endpoint                             | Description               |
| ------ | ------------------------------------ | ------------------------- |
| POST   | `/api/jokes`                         | Add a new joke            |
| PUT    | `/api/jokes/:id`                     | Update a joke by ID       |
| GET    | `/api/jokes/:id/verification`        | Verify a joke             |
| GET    | `/api/jokes`                         | Get all jokes             |
| GET    | `/api/jokes/user/:id/`               | Get jokes by user ID      |
| DELETE | `/api/jokes/:id/delete-user/:userId` | Delete a user from a joke |

### High Score Endpoints

| Method | Endpoint                                       | Description                       |
| ------ | ---------------------------------------------- | --------------------------------- |
| GET    | `/api/highscores/:language`                    | Get all high scores               |
| POST   | `/api/highscores/:language/key/:levelKey`      | Add a high score                  |
| GET    | `/api/highscores/:language/key/:levelKey`      | Get high scores by level          |
| PUT    | `/api/highscores/:language/id/:id`             | Update a high score by ID         |
| DELETE | `/api/highscores/:language/id/:id`             | Delete a high score by ID         |
| DELETE | `/api/highscores/:language/player/:playerName` | Delete high scores by player name |
| PUT    | `/api/highscores/:language/player`             | Change player name                |
| POST   | `/api/highscores/:language/cleanup/:levelKey`  | Clean up high scores              |

### Image Endpoints

| Method | Endpoint                | Description   |
| ------ | ----------------------- | ------------- |
| GET    | `/api/images/:language` | Search images |

### Quote Endpoints

| Method | Endpoint                          | Description                         |
| ------ | --------------------------------- | ----------------------------------- |
| GET    | `/api/quotes/:language/:category` | Get quotes by language and category |

### Email Endpoints

| Method | Endpoint                 | Description                         |
| ------ | ------------------------ | ----------------------------------- |
| POST   | `/api/send-email-form`   | Send an email using a form          |
| POST   | `/api/send-email-select` | Send an email with selected options |

### Cart Endpoints

| Method | Endpoint                       | Description           |
| ------ | ------------------------------ | --------------------- |
| POST   | `/api/cart/:language`          | Create a new order    |
| GET    | `/api/cart/:language/:orderID` | Get an order by ID    |
| GET    | `/api/cart/:language`          | Get all orders        |
| DELETE | `/api/cart/:language/:orderID` | Delete an order by ID |
| PUT    | `/api/cart/:language/:orderID` | Update an order by ID |

### Blob Endpoints

| Method | Endpoint                                     | Description                 |
| ------ | -------------------------------------------- | --------------------------- |
| GET    | `/api/blobs/:user/:d`                        | Get all blobs by user       |
| GET    | `/api/blobs/:user/:d/:versionName/:language` | Get blob version by user    |
| POST   | `/api/blobs/:user/:d/:versionName/:language` | Save blobs by user          |
| DELETE | `/api/blobs/:user/:d/:versionName/:language` | Delete blob version by user |
| PUT    | `/api/blobs/:user/:d/:versionName/:language` | Edit blobs by user          |
| POST   | `/api/blobs/screenshot`                      | Take a screenshot           |

## Technologies Used

The backend is built with the following technologies:

**Languages & Frameworks**

- **Node.js**: JavaScript runtime
- **TypeScript**: Typed superset of JavaScript
- **Express**: Web framework for Node.js

**Database**

- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM

**Authentication & Security**

- **bcryptjs**: Password hashing
- **jsonwebtoken**: Token-based authentication
- **sanitize-html**: HTML sanitization

**Utilities**

- **Nodemailer**: Email sending

**Development Tools**

- **TypeScript**: Static typing
- **dotenv**: Environment variable management
- **Concurrently**: Running multiple commands concurrently
- **nodemon**: Development tool for auto-restarting the server

# Contact

For any questions, please contact the author at [https://jenniina.fi](https://jenniina.fi)
