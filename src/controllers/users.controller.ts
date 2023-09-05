import { createUser } from '../models/users.model.js'

export function postUser(request, response, next) {
	createUser(request.body)
		.then((user) => {
			response.status(201).send({ user: user })
		})
		.catch((error) => {
			next(error)
		})
}
