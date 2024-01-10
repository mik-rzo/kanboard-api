import { insertBoard, findBoardById, addBoardList } from '../models/boards.model.js'
import { findWorkspaceById, authorization } from '../models/workspaces.model.js'
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
			response.status(201).send({ board: board })
		})
		.catch((error) => {
			next(error)
		})
}

export function postBoardList(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { listHeader } = request.body
	const { board_id } = request.params
	return findBoardById(new ObjectId(board_id))
		.then((board) => {
			if (!board) {
				return Promise.reject({ code: 404, message: 'Board matching ID not found.' })
			}
			const workspaceId = board.workspace
			return authorization(workspaceId, authenticatedUserId)
		})
		.then(() => {
			return addBoardList(listHeader, board_id)
		})
		.then((board) => {
			const list = board.lists.at(-1)
			response.status(201).send({ list: list })
		})
		.catch((error) => {
			next(error)
		})
}
