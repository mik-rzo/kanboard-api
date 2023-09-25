import { insertWorkspace, findWorkspaceById, authorization, updateWorkspaceName } from '../models/workspaces.model.js'
import { ObjectId } from 'mongodb'

export function postWorkspace(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { workspaceName } = request.body
	return insertWorkspace(workspaceName, authenticatedUserId)
		.then((workspace) => {
			response.status(201).send({ workspace: workspace })
		})
		.catch((error) => {
			next(error)
		})
}

export function patchWorkspace(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { workspaceName } = request.body
	const { workspace_id } = request.params
	return findWorkspaceById(new ObjectId(workspace_id))
		.then((workspace) => {
			if (!workspace) {
				return Promise.reject({ code: 404, message: 'Workspace matching ID not found.' })
			}
			return authorization(workspace_id, authenticatedUserId)
		})
		.then(() => {
			return updateWorkspaceName(workspace_id, workspaceName)
		})
		.then((workspace) => {
			response.status(200).send({ workspace: workspace })
		})
		.catch((error) => {
			next(error)
		})
}
