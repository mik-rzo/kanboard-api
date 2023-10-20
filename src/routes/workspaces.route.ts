import { Router } from 'express'
import { postWorkspace, patchWorkspaceName, patchWorkspaceUsers } from '../controllers/workspaces.controller.js'
import { authentication } from '../authentication.js'

const workspacesRouter = Router()

workspacesRouter.route('/').post(authentication, postWorkspace)

workspacesRouter.route('/:workspace_id/name').patch(authentication, patchWorkspaceName)

workspacesRouter.route('/:workspace_id/users').patch(authentication, patchWorkspaceUsers)

export default workspacesRouter
