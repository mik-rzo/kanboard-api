import {
	insertWorkspace,
	findWorkspaceById,
	findWorkspacesByUser,
	deleteWorkspaceDocument,
	authorization,
	updateWorkspaceName,
	addWorkspaceUser,
	removeWorkspaceUser
} from '../models/workspaces.model.js'
import { ObjectId } from 'mongodb'

export function postWorkspace(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { workspaceName } = request.body
	return insertWorkspace(workspaceName, authenticatedUserId)
		.then((workspace) => {
			response.status(201).send({ workspace: workspace })
		})
		.catch((error) => {
			next(error)
		})
}

export function getUsersWorkspaces(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	return findWorkspacesByUser(authenticatedUserId)
		.then((workspaces) => {
			response.status(200).send({ workspaces: workspaces })
		})
		.catch((error) => {
			next(error)
		})
}

export function deleteWorkspace(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { workspace_id } = request.params
	return findWorkspaceById(new ObjectId(workspace_id))
		.then((workspace) => {
			if (!workspace) {
				return Promise.reject({ code: 404, message: 'Workspace matching ID not found.' })
			}
			return authorization(workspace_id, authenticatedUserId)
		})
		.then(() => {
			return deleteWorkspaceDocument(workspace_id)
		})
		.then(() => {
			response.sendStatus(204)
		})
		.catch((error) => {
			next(error)
		})
}

export function patchWorkspaceName(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { name } = request.body
	const { workspace_id } = request.params
	return findWorkspaceById(new ObjectId(workspace_id))
		.then((workspace) => {
			if (!workspace) {
				return Promise.reject({ code: 404, message: 'Workspace matching ID not found.' })
			}
			return authorization(workspace_id, authenticatedUserId)
		})
		.then(() => {
			return updateWorkspaceName(workspace_id, name)
		})
		.then((workspace) => {
			response.status(200).send({ workspace: workspace })
		})
		.catch((error) => {
			next(error)
		})
}

export function patchWorkspaceUsers(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { workspace_id } = request.params
	return findWorkspaceById(new ObjectId(workspace_id))
		.then((workspace) => {
			if (!workspace) {
				return Promise.reject({ code: 404, message: 'Workspace matching ID not found.' })
			}
			return addWorkspaceUser(workspace_id, authenticatedUserId)
		})
		.then((workspace) => {
			response.status(200).send({ workspace: workspace })
		})
		.catch((error) => {
			next(error)
		})
}

export function deleteWorkspaceUser(request, response, next) {
	const authenticatedUserId = request.session.authenticated
	const { workspace_id, user_id } = request.params
	return findWorkspaceById(new ObjectId(workspace_id))
		.then((workspace) => {
			if (!workspace) {
				return Promise.reject({ code: 404, message: 'Workspace matching ID not found.' })
			}
			return authorization(workspace_id, authenticatedUserId)
		})
		.then(() => {
			return removeWorkspaceUser(workspace_id, user_id)
		})
		.then((workspace) => {
			if (workspace.users.length === 0) {
				return deleteWorkspaceDocument(workspace_id)
			}
		})
		.then(() => {
			response.sendStatus(204)
		})
		.catch((error) => {
			next(error)
		})
}
