import pool from '../db/connection.js'
import bcrypt from 'bcrypt'
import { convertUserObjectIdsToStrings } from '../utils.js'

export function createUser(user) {
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
			return Promise.all([db, db.collection('users').insertOne(user)])
		})
		.then(([db, result]) => {
			const userId = result.insertedId
			const workspace = {
				name: 'Personal',
				users: [userId],
				boards: []
			}
			return Promise.all([userId, db.collection('workspaces').insertOne(workspace)])
		})
		.then(([userId, result]) => {
			return findUserById(userId)
		})
}

export function findUserById(userId) {
	return pool
		.then((db) => {
			return db.collection('users').findOne({ _id: userId })
		})
		.then((result) => {
			if (result === null) {
				return null
			}
			const user = convertUserObjectIdsToStrings(result)
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
			const user = convertUserObjectIdsToStrings(result)
			return user
		})
}
