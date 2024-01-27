import { Router } from 'express'
import { postBoard, postBoardLabel, postBoardList } from '../controllers/boards.controller.js'
import { authentication } from '../authentication.js'

const boardsRouter = Router()

boardsRouter.route('/').post(authentication, postBoard)

boardsRouter.route('/:board_id/lists').post(authentication, postBoardList)

boardsRouter.route('/:board_id/labels').post(authentication, postBoardLabel)

export default boardsRouter
