import { Router } from 'express'
import {
	postWorkspace,
	getUsersWorkspaces,
	deleteWorkspace,
	patchWorkspaceName,
	patchWorkspaceUsers
} from '../controllers/workspaces.controller.js'
import { authentication } from '../authentication.js'

const workspacesRouter = Router()

workspacesRouter.route('/').post(authentication, postWorkspace).get(authentication, getUsersWorkspaces)

workspacesRouter.route('/:workspace_id').delete(authentication, deleteWorkspace)

workspacesRouter.route('/:workspace_id/name').patch(authentication, patchWorkspaceName)

workspacesRouter.route('/:workspace_id/users').patch(authentication, patchWorkspaceUsers)

export default workspacesRouter
