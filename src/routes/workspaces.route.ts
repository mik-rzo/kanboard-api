import { Router } from 'express'
import { postWorkspace, patchWorkspace } from '../controllers/workspaces.controller.js'
import { authentication } from '../authentication.js'

const workspacesRouter = Router()

workspacesRouter.route('/').post(authentication, postWorkspace)

workspacesRouter.route('/:workspace_id').patch(authentication, patchWorkspace)

export default workspacesRouter
