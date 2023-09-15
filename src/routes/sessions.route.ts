import { Router } from 'express'
import { postSession } from '../controllers/sessions.controller.js'

const sessionsRouter = Router()

sessionsRouter.post('/', postSession)

export default sessionsRouter
