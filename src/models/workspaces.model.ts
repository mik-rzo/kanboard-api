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

export function findWorkspacesByUser(userId) {
	return pool
		.then((db) => {
			return db
				.collection('workspaces')
				.find({ users: new ObjectId(userId) })
				.toArray()
		})
		.then((result) => {
			return result.map((workspace) => {
				return convertWorkspaceObjectIdsToString(workspace)
			})
		})
}

export function deleteWorkspaceDocument(workspaceId) {
	workspaceId = new ObjectId(workspaceId)
	return pool.then((db) => {
		return db.collection('workspaces').deleteOne({ _id: workspaceId })
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
			return Promise.all([db.collection('workspaces').findOne({ _id: workspaceId }), db])
		})
		.then(([workspace, db]) => {
			const duplicateUser: boolean = workspace.users.some((compareUserId: ObjectId) => compareUserId.equals(userId))
			const updatedWorkspace = duplicateUser === false ? addUserToWorkspace(workspace, userId) : workspace
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
				return Promise.reject({ code: 403, message: 'User is not part of workspace.' })
			} else {
				return Promise.resolve()
			}
		})
}
