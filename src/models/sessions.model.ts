import pool from '../db/connection.js'
import bcrypt from 'bcrypt'
import { findUserByEmail } from './users.model.js'

interface LoginRequestBody {
	email: string
	password: string
}

export function insertSession(login: LoginRequestBody) {
	if (!login.email || !login.password) {
		return Promise.reject({ code: 400, message: 'Missing email or password.' })
	}
	const { email } = login
	return findUserByEmail(email)
		.then((user) => {
			return bcrypt.compare(login.password, user.password)
		})
		.then((result) => {
			if (result === true) {
				return
			} else {
				return Promise.reject({ message: 'Incorrect password.' })
			}
		})
}
