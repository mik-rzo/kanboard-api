import pool from '../db/connection.js'
import { findUserById } from './users.model.js'
import { ObjectId } from 'mongodb'

export function insertWorkspace(workspaceName, userId) {
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
			if (result === null) {
				return null
			}
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

export function updateWorkspaceName(workspaceId, workspaceName) {
	workspaceId = new ObjectId(workspaceId)
	return pool
		.then((db) => {
			return db.collection('workspaces').updateOne({ _id: workspaceId }, { $set: { name: workspaceName } })
		})
		.then((result) => {
			return findWorkspaceById(workspaceId)
		})
}

export function authorization(workspaceId, userId) {
	userId = new ObjectId(userId)
	return pool
		.then((db) => {
			return db.collection('users').findOne({ _id: userId })
		})
		.then((result) => {
			const workspaces = [...result.workspaces]
			const authorized = workspaces.includes(workspaceId)
			if (authorized) {
				return Promise.resolve()
			} else {
				return Promise.reject({ code: 403, message: 'Not authorized.' })
			}
		})
}
