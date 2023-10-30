import bcrypt from 'bcrypt'
import { findUserByEmail } from './users.model.js'

interface LoginRequestBody {
	email: string
	password: string
}

export function insertSession(login: LoginRequestBody, session) {
	if (!login.email || !login.password) {
		return Promise.reject({ code: 400, message: 'Missing email or password.' })
	}
	const { email } = login
	return findUserByEmail(email)
		.then((user) => {
			return Promise.all([bcrypt.compare(login.password, user.password), user])
		})
		.then(([result, user]) => {
			if (result === true) {
				session.authenticated = user._id
				return Promise.resolve()
			} else {
				return Promise.reject({ message: 'Incorrect password.' })
			}
		})
}

export function deleteSessionDocument(session) {
	if (session.hasOwnProperty('authenticated') === true) {
		return Promise.resolve(session.destroy())
	} else {
		return Promise.reject({ code: 401, message: 'Already logged out.' })
	}
}
