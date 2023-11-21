import { Router } from 'express'
import { postBoard } from '../controllers/boards.controller.js'

const boardsRouter = Router()

boardsRouter.route('/').post(postBoard)

export default boardsRouter
