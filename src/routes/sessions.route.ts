import { Router } from 'express'
import { postSession, deleteSession } from '../controllers/sessions.controller.js'

const sessionsRouter = Router()

sessionsRouter.route('/').post(postSession).delete(deleteSession)

export default sessionsRouter
