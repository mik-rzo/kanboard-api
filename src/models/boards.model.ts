import pool from '../db/connection.js'
import { ObjectId } from 'mongodb'
import { convertBoardObjectIdsToStrings } from '../utils.js'

export function insertBoard(boardName, workspaceId) {
	workspaceId = new ObjectId(workspaceId)
	return pool
		.then((db) => {
			return db.collection('boards').insertOne({ name: boardName, workspace: workspaceId, labels: [], lists: [] })
		})
		.then((result) => {
			const boardId = result.insertedId
			return findBoardById(boardId)
		})
}

export function findBoardById(boardId) {
	return pool
		.then((db) => {
			return db.collection('boards').findOne({ _id: boardId })
		})
		.then((result) => {
			if (result === null) {
				return null
			}
			const board = convertBoardObjectIdsToStrings(result)
			return board
		})
}
