import { Router } from 'express'
import { postUser } from '../controllers/users.controller.js'

const usersRouter = Router()

usersRouter.route('/').post(postUser)

export default usersRouter
