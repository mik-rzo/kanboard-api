import pool from '../db/connection.js'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import { convertUserObjectIdsToString } from '../utils.js'

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
			const personalWorkspaceId = new ObjectId()
			user.workspaces = [personalWorkspaceId.toString()]
			const insertUserDoc = db.collection('users').insertOne(user)
			const insertWorkspaceDoc = db.collection('workspaces').insertOne({
				_id: personalWorkspaceId,
				name: 'Personal'
			})
			return Promise.all([insertUserDoc, insertWorkspaceDoc])
		})
		.then(([user, workspace]) => {
			return user.insertedId
		})
		.then((id) => {
			return findUserById(id)
		})
}

export function findUserById(userId) {
	return pool
		.then((db) => {
			return db.collection('users').findOne({ _id: userId })
		})
		.then((result) => {
			interface UserResponseBody {
				_id: string
				fullName: string
				email: string
				password: string
				workspaces: string[]
			}
			const user: UserResponseBody = convertUserObjectIdsToString(result)
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
				workspaces: string[]
			}
			const user: UserResponseBody = convertUserObjectIdsToString(result)
			return user
		})
}
