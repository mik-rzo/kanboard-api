import pool from '../db/connection.js'
import { ObjectId } from 'mongodb'
import { convertBoardObjectIdsToStrings, addListToBoard } from '../utils.js'

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

export function addBoardList(listHeader, boardId) {
	boardId = new ObjectId(boardId)
	const list = {
		_id: new ObjectId(),
		header: listHeader,
		cards: []
	}
	return pool
		.then((db) => {
			return Promise.all([db.collection('boards').findOne({ _id: boardId }), db])
		})
		.then(([result, db]) => {
			const updatedBoard = addListToBoard(result, list)
			return db.collection('boards').updateOne({ _id: boardId }, { $set: { lists: updatedBoard.lists } })
		})
		.then(() => {
			return findBoardById(boardId)
		})
}
