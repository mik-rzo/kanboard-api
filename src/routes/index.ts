import { Router } from 'express'
import usersRouter from './users.route.js'
import sessionsRouter from './sessions.route.js'
import workspacesRouter from './workspaces.route.js'
import boardsRouter from './boards.route.js'

const router = Router()

router.use('/api/users', usersRouter)

router.use('/api/sessions', sessionsRouter)

router.use('/api/workspaces', workspacesRouter)

router.use('/api/boards', boardsRouter)

export default router
