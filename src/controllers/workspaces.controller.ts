import { insertWorkspace } from '../models/workspaces.model.js'

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
