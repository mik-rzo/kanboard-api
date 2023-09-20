import { Router } from 'express'
import usersRouter from './users.route.js'
import sessionsRouter from './sessions.route.js'
import workspacesRouter from './workspaces.route.js'

const router = Router()

router.use('/api/users', usersRouter)

router.use('/api/sessions', sessionsRouter)

router.use('/api/workspaces', workspacesRouter)

export default router
