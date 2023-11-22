import { Router } from 'express'
import { postBoard } from '../controllers/boards.controller.js'
import { authentication } from '../authentication.js'

const boardsRouter = Router()

boardsRouter.route('/').post(authentication, postBoard)

export default boardsRouter
