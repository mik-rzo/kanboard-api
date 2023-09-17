import { insertSession } from '../models/sessions.model.js'

export function postSession(request, response, next) {
	insertSession(request.body)
		.then(() => {
			request.session.authenticated = true
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
