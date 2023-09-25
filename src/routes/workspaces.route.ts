import { Router } from 'express'
import { postWorkspace } from '../controllers/workspaces.controller.js'
import { authentication } from '../auth.js'

const workspacesRouter = Router()

workspacesRouter.route('/').post(authentication, postWorkspace)

export default workspacesRouter
