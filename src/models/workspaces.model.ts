import pool from '../db/connection.js'
import { findUserById } from './users.model.js'
import { ObjectId } from 'mongodb'

export function insertWorkspace(workspaceName, userId) {
	if (!userId) {
		return Promise.reject({ code: 401, message: 'Not logged in.' })
	}
	userId = new ObjectId(userId)
	return findUserById(userId)
		.then((user) => {
			interface WorkspaceI {
				workspaceId: ObjectId
				workspaceName: string
			}
			const workspaces: WorkspaceI[] = user.workspaces.map((workspace) => {
				return { ...workspace, workspaceId: new ObjectId(workspace.workspaceId) }
			})
			const newWorkspace: WorkspaceI = {
				workspaceId: new ObjectId(),
				workspaceName: workspaceName
			}
			workspaces.push(newWorkspace)
			return Promise.all([pool, workspaces, newWorkspace])
		})
		.then(([db, updatedWorkspaces, newWorkspace]) => {
			const updateDb = db.collection('users').updateOne({ _id: userId }, { $set: { workspaces: updatedWorkspaces } })
			return Promise.all([updateDb, newWorkspace])
		})
		.then(([updateResult, newWorkspace]) => {
			return newWorkspace
		})
}
