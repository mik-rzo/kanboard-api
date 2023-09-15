import pool from '../db/connection.js'
import bcrypt from 'bcrypt'

interface UserRequestBody {
	fullName: string
	email: string
	password: string
}

export function createUser(user: UserRequestBody) {
	if (!user.password) {
		return Promise.reject({ code: 121 }) // same error code thrown by Mongo driver when user document fails schema validation
	}

	return bcrypt
		.hash(user.password, 10)
		.then((hash: string) => {
			user.password = hash
			return Promise.all([pool, user])
		})
		.then(([db, user]) => {
			return db.collection('users').insertOne(user)
		})
		.then((result) => {
			return result.insertedId
		})
		.then((id) => {
			return findUserById(id)
		})
}

export function findUserById(userID) {
	return pool
		.then((db) => {
			return db.collection('users').findOne({ _id: userID })
		})
		.then((result) => {
			interface UserResponseBody {
				_id: string
				fullName: string
				email: string
				password: string
			}
			const user: UserResponseBody = {
				_id: result._id.toString(),
				fullName: result.fullName,
				email: result.email,
				password: result.password
			}
			return user
		})
}

export function findUserByEmail(email) {
	return pool
		.then((db) => {
			return db.collection('users').findOne({ email: email })
		})
		.then((result) => {
			if (result === null) {
				return Promise.reject({ code: 404, message: 'Account with email not found.' })
			}
			interface UserResponseBody {
				_id: string
				fullName: string
				email: string
				password: string
			}
			const user: UserResponseBody = {
				_id: result._id.toString(),
				fullName: result.fullName,
				email: result.email,
				password: result.password
			}
			return user
		})
}
