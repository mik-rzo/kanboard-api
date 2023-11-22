import { insertBoard } from '../models/boards.model.js'
import { findWorkspaceById, authorization, addWorkspaceBoard } from '../models/workspaces.model.js'
import { ObjectId } from 'mongodb'

export function postBoard(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { boardName, workspaceId } = request.body
	if (!workspaceId) {
		return next({ code: 400, message: 'Missing required information in request body.' })
	}
	return findWorkspaceById(new ObjectId(workspaceId))
		.then((workspace) => {
			if (!workspace) {
				return Promise.reject({ code: 404, message: 'Workspace matching ID not found.' })
			}
			return authorization(workspaceId, authenticatedUserId)
		})
		.then(() => {
			return insertBoard(boardName, workspaceId)
		})
		.then((board) => {
			const boardId = board._id
			return Promise.all([addWorkspaceBoard(workspaceId, boardId), board])
		})
		.then(([workspace, board]) => {
			response.status(201).send({ board: board })
		})
		.catch((error) => {
			next(error)
		})
}
