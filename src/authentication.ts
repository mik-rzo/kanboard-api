import { findUserById } from './models/users.model.js'
import { ObjectId } from 'mongodb'

export function authentication(request, response, next) {
	const authenticatedUserId = new ObjectId(request.session.authenticated)
	return findUserById(authenticatedUserId)
		.then((user) => {
			if (!user) {
				return Promise.reject({ code: 401, message: 'Not logged in.' })
			}
			next()
		})
		.catch((error) => {
			next(error)
		})
}
