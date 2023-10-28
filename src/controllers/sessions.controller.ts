import { insertSession, deleteSessionDocument } from '../models/sessions.model.js'

export function postSession(request, response, next) {
	insertSession(request.body, request.session)
		.then(() => {
			response.sendStatus(201)
		})
		.catch((error) => {
			if (error.message === 'Account with email not found.' || error.message === 'Incorrect password.') {
				error.code = 401
				error.message = 'Incorrect email or password.'
			}
			next(error)
		})
}

export function deleteSession(request, response, next) {
	const session = request.session
	return deleteSessionDocument(session)
		.then(() => {
			response.sendStatus(204)
		})
		.catch((error) => {
			next(error)
		})
}
