import pool from '../db/connection.js'
import { ObjectId } from 'mongodb'
import { convertWorkspaceObjectIdsToString, addUserToWorkspace } from '../utils.js'

export function insertWorkspace(workspaceName, userId) {
	userId = new ObjectId(userId)
	return pool
		.then((db) => {
			return db.collection('workspaces').insertOne({ name: workspaceName, users: [userId] })
		})
		.then((result) => {
			const workspaceId = result.insertedId
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
			const workspace = convertWorkspaceObjectIdsToString(result)
			return workspace
		})
}

export function updateWorkspaceName(workspaceId, workspaceName) {
	workspaceId = new ObjectId(workspaceId)
	return pool
		.then((db) => {
			return db.collection('workspaces').updateOne({ _id: workspaceId }, { $set: { name: workspaceName } })
		})
		.then(() => {
			return findWorkspaceById(workspaceId)
		})
}

export function addWorkspaceUser(workspaceId, userId) {
	workspaceId = new ObjectId(workspaceId)
	userId = new ObjectId(userId)
	return pool
		.then((db) => {
			return Promise.all([findWorkspaceById(workspaceId), db])
		})
		.then(([workspace, db]) => {
			const updatedWorkspace =
				workspace.users.includes(userId) === false ? addUserToWorkspace(workspace, userId) : workspace
			updatedWorkspace.users = updatedWorkspace.users.map((userId) => {
				return new ObjectId(userId)
			})
			return db.collection('workspaces').updateOne({ _id: workspaceId }, { $set: { users: updatedWorkspace.users } })
		})
		.then(() => {
			return findWorkspaceById(workspaceId)
		})
}

export function authorization(workspaceId, userId) {
	workspaceId = new ObjectId(workspaceId)
	return pool
		.then((db) => {
			return db.collection('workspaces').findOne({ _id: workspaceId })
		})
		.then((result) => {
			const users = result.users.map((userId) => {
				return userId.toString()
			})
			const authorized = users.includes(userId)
			if (!authorized) {
				return Promise.reject({ code: 403, message: 'Not authorized.' })
			} else {
				return Promise.resolve()
			}
		})
}
