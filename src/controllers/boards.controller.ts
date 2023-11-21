import { insertBoard } from '../models/boards.model.js'

export function postBoard(request, response, next) {
	const { boardName, workspaceId } = request.body
	return insertBoard(boardName, workspaceId)
		.then((board) => {
			response.status(201).send({ board: board })
		})
		.catch((error) => {
			next(error)
		})
}
