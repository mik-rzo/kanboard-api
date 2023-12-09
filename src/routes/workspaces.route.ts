import { Router } from 'express'
import {
	postWorkspace,
	getUsersWorkspaces,
	deleteWorkspace,
	patchWorkspaceName,
	patchWorkspaceUsers,
	deleteWorkspaceUser
} from '../controllers/workspaces.controller.js'
import { authentication } from '../authentication.js'

const workspacesRouter = Router()

workspacesRouter.route('/').post(authentication, postWorkspace).get(authentication, getUsersWorkspaces)

workspacesRouter
	.route('/:workspace_id')
	.patch(authentication, patchWorkspaceName)
	.delete(authentication, deleteWorkspace)

workspacesRouter.route('/:workspace_id/users').patch(authentication, patchWorkspaceUsers)

workspacesRouter.route('/:workspace_id/users/:user_id').delete(authentication, deleteWorkspaceUser)

export default workspacesRouter
