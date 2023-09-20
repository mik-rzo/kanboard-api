import { Router } from 'express'
import { postWorkspace } from '../controllers/workspaces.controller.js'

const workspacesRouter = Router()

workspacesRouter.route('/').post(postWorkspace)

export default workspacesRouter
