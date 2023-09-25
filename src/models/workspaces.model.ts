import pool from '../db/connection.js'
import { findUserById } from './users.model.js'
import { ObjectId } from 'mongodb'

export function insertWorkspace(workspaceName, userId) {
	if (!userId) {
		return Promise.reject({ code: 401, message: 'Not logged in.' })
	}
	userId = new ObjectId(userId)
	return pool
		.then((db) => {
			const insertWorkspaceDoc = db.collection('workspaces').insertOne({ name: workspaceName })
			return Promise.all([insertWorkspaceDoc, db])
		})
		.then(([result, db]) => {
			return Promise.all([findUserById(userId), result.insertedId, db])
		})
		.then(([user, workspaceId, db]) => {
			const workspaces = [...user.workspaces]
			workspaces.push(workspaceId.toString())
			const updateUserDoc = db.collection('users').updateOne({ _id: userId }, { $set: { workspaces: workspaces } })
			return Promise.all([updateUserDoc, workspaceId])
		})
		.then(([result, workspaceId]) => {
			return findWorkspaceById(workspaceId)
		})
}

export function findWorkspaceById(workspaceId) {
	return pool
		.then((db) => {
			return db.collection('workspaces').findOne({ _id: workspaceId })
		})
		.then((result) => {
			interface WorkspaceI {
				_id: string
				name: string
			}
			const workspace: WorkspaceI = {
				_id: result._id.toString(),
				name: result.name
			}
			return workspace
		})
}
