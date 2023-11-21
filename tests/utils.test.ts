import { describe, test, expect } from 'vitest'
import {
	convertUserObjectIdsToStrings,
	convertWorkspaceObjectIdsToStrings,
	convertBoardObjectIdsToStrings,
	addUserToWorkspace,
	deleteUserFromWorkspace,
	addBoardToWorkspace
} from '../src/utils'
import { ObjectId } from 'mongodb'

describe('convertUserObjectIdsToStrings()', () => {
	test('returns a new object', () => {
		interface UserI {
			_id: ObjectId
			fullName: string
			email: string
			password: string
		}
		const user: UserI = {
			_id: new ObjectId(),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa'
		}
		const output = convertUserObjectIdsToStrings(user)
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(user)
	})
	test('converts all objectIds to strings', () => {
		interface UserI {
			_id: ObjectId
			fullName: string
			email: string
			password: string
		}
		const user: UserI = {
			_id: new ObjectId(),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa'
		}
		const output = convertUserObjectIdsToStrings(user)
		expect(output._id).toBeTypeOf('string')
	})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('650b03752d79f6b6f822dae7'),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa'
		}
		const control = {
			_id: new ObjectId('650b03752d79f6b6f822dae7'),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa'
		}
		convertUserObjectIdsToStrings(input)
		expect(input).toEqual(control)
	})
})

describe('convertWorkspaceObjectIdsToStrings()', () => {
	test('returns a new object', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()],
			boards: [new ObjectId(), new ObjectId()]
		}
		const output = convertWorkspaceObjectIdsToStrings(workspace)
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(workspace)
	})
	test('converts all objectIds to strings', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()],
			boards: [new ObjectId(), new ObjectId()]
		}
		const output = convertWorkspaceObjectIdsToStrings(workspace)
		expect(output._id).toBeTypeOf('string')
		output.users.forEach((userId) => {
			expect(userId).toBeTypeOf('string')
		})
		output.boards.forEach((boardId) => {
			expect(boardId).toBeTypeOf('string')
		})
	})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('65200dee4d6406e7cedc7d16'),
			name: 'Buggy Bears',
			users: [
				new ObjectId('65200dee4d6406e7cedc7d17'),
				new ObjectId('65200dee4d6406e7cedc7d18'),
				new ObjectId('65200dee4d6406e7cedc7d19'),
				new ObjectId('65200dee4d6406e7cedc7d1a'),
				new ObjectId('65200dee4d6406e7cedc7d1b')
			],
			boards: [new ObjectId('65200dee4d6406e7cedc7d1c'), new ObjectId('65200dee4d6406e7cedc7d1d')]
		}
		const control = {
			_id: new ObjectId('65200dee4d6406e7cedc7d16'),
			name: 'Buggy Bears',
			users: [
				new ObjectId('65200dee4d6406e7cedc7d17'),
				new ObjectId('65200dee4d6406e7cedc7d18'),
				new ObjectId('65200dee4d6406e7cedc7d19'),
				new ObjectId('65200dee4d6406e7cedc7d1a'),
				new ObjectId('65200dee4d6406e7cedc7d1b')
			],
			boards: [new ObjectId('65200dee4d6406e7cedc7d1c'), new ObjectId('65200dee4d6406e7cedc7d1d')]
		}
		convertWorkspaceObjectIdsToStrings(input)
		expect(input).toEqual(control)
	})
})

describe('convertBoardObjectIdsToStrings()', () => {
	test('returns a new object', () => {
		interface BoardI {
			_id: ObjectId
			name: string
			labels: {
				_id: ObjectId
				colour: string
				title: string
			}[]
			lists: {
				_id: ObjectId
				header: string
				cards: {
					_id: ObjectId
					title: string
					description: string
					assign: ObjectId[]
					labels: ObjectId[]
				}[]
			}[]
		}
		const board: BoardI = {
			_id: new ObjectId(),
			name: 'House of Games API',
			labels: [
				{ _id: new ObjectId(), colour: 'red', title: 'Core Task' },
				{ _id: new ObjectId(), colour: 'blue', title: 'Further Task' },
				{ _id: new ObjectId(), colour: 'purple', title: 'New Endpoint' },
				{ _id: new ObjectId(), colour: 'yellow', title: 'Refactor' }
			],
			lists: [
				{
					_id: new ObjectId(),
					header: 'Tasks',
					cards: [
						{
							_id: new ObjectId(),
							title: 'POST /api/users',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId(), new ObjectId()]
						},
						{
							_id: new ObjectId(),
							title: 'GET /api/reviews (queries)',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				},
				{
					_id: new ObjectId(),
					header: 'In progress',
					cards: [
						{
							_id: new ObjectId(),
							title: 'GET /api/reviews/:review_id',
							description: 'Lorem ipsum',
							assign: [new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						},
						{
							_id: new ObjectId(),
							title: 'POST /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId(), new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				},
				{
					_id: new ObjectId(),
					header: 'Code Review',
					cards: [
						{
							_id: new ObjectId(),
							title: 'GET /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				},
				{
					_id: new ObjectId(),
					header: 'Done',
					cards: [
						{
							_id: new ObjectId(),
							title: 'GET /api/categories',
							description: 'Lorem ipsum',
							assign: [new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				}
			]
		}
		const output = convertBoardObjectIdsToStrings(board)
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(board)
	})
	test('converts all objectIds to strings', () => {
		interface BoardI {
			_id: ObjectId
			name: string
			labels: {
				_id: ObjectId
				colour: string
				title: string
			}[]
			lists: {
				_id: ObjectId
				header: string
				cards: {
					_id: ObjectId
					title: string
					description: string
					assign: ObjectId[]
					labels: ObjectId[]
				}[]
			}[]
		}
		const board: BoardI = {
			_id: new ObjectId(),
			name: 'House of Games API',
			labels: [
				{ _id: new ObjectId(), colour: 'red', title: 'Core Task' },
				{ _id: new ObjectId(), colour: 'blue', title: 'Further Task' },
				{ _id: new ObjectId(), colour: 'purple', title: 'New Endpoint' },
				{ _id: new ObjectId(), colour: 'yellow', title: 'Refactor' }
			],
			lists: [
				{
					_id: new ObjectId(),
					header: 'Tasks',
					cards: [
						{
							_id: new ObjectId(),
							title: 'POST /api/users',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId(), new ObjectId()]
						},
						{
							_id: new ObjectId(),
							title: 'GET /api/reviews (queries)',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				},
				{
					_id: new ObjectId(),
					header: 'In progress',
					cards: [
						{
							_id: new ObjectId(),
							title: 'GET /api/reviews/:review_id',
							description: 'Lorem ipsum',
							assign: [new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						},
						{
							_id: new ObjectId(),
							title: 'POST /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId(), new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				},
				{
					_id: new ObjectId(),
					header: 'Code Review',
					cards: [
						{
							_id: new ObjectId(),
							title: 'GET /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				},
				{
					_id: new ObjectId(),
					header: 'Done',
					cards: [
						{
							_id: new ObjectId(),
							title: 'GET /api/categories',
							description: 'Lorem ipsum',
							assign: [new ObjectId()],
							labels: [new ObjectId(), new ObjectId()]
						}
					]
				}
			]
		}
		const output = convertBoardObjectIdsToStrings(board)
		expect(output._id).toBeTypeOf('string')
		output.labels.forEach((label) => {
			expect(label._id).toBeTypeOf('string')
		})
		output.lists.forEach((list) => {
			expect(list._id).toBeTypeOf('string')
			list.cards.forEach((card) => {
				expect(card._id).toBeTypeOf('string')
				card.assign.forEach((userId) => {
					expect(userId).toBeTypeOf('string')
				})
				card.labels.forEach((labelId) => {
					expect(labelId).toBeTypeOf('string')
				})
			})
		})
	})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('655ce66c141579aa9fa85001'),
			name: 'House of Games API',
			labels: [
				{ _id: new ObjectId('655ce66c141579aa9fa85002'), colour: 'red', title: 'Core Task' },
				{ _id: new ObjectId('655ce66c141579aa9fa85003'), colour: 'blue', title: 'Further Task' },
				{ _id: new ObjectId('655ce66c141579aa9fa85004'), colour: 'purple', title: 'New Endpoint' },
				{ _id: new ObjectId('655ce66c141579aa9fa85005'), colour: 'yellow', title: 'Refactor' }
			],
			lists: [
				{
					_id: new ObjectId('655ce66c141579aa9fa85006'),
					header: 'Tasks',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa85007'),
							title: 'POST /api/users',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						},
						{
							_id: new ObjectId('655ce66c141579aa9fa85021'),
							title: 'GET /api/reviews (queries)',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId('655ce66c141579aa9fa85003'), new ObjectId('655ce66c141579aa9fa85005')]
						}
					]
				},
				{
					_id: new ObjectId('655ce66c141579aa9fa85008'),
					header: 'In progress',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa85009'),
							title: 'GET /api/reviews/:review_id',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85011')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						},
						{
							_id: new ObjectId('655ce66c141579aa9fa8500a'),
							title: 'POST /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85012'), new ObjectId('655ce66c141579aa9fa85013')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						}
					]
				},
				{
					_id: new ObjectId('655ce66c141579aa9fa8500b'),
					header: 'Code Review',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa8500c'),
							title: 'GET /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85014')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						}
					]
				},
				{
					_id: new ObjectId('655ce66c141579aa9fa8500d'),
					header: 'Done',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa8500e'),
							title: 'GET /api/categories',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85014')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						}
					]
				}
			]
		}
		const control = {
			_id: new ObjectId('655ce66c141579aa9fa85001'),
			name: 'House of Games API',
			labels: [
				{ _id: new ObjectId('655ce66c141579aa9fa85002'), colour: 'red', title: 'Core Task' },
				{ _id: new ObjectId('655ce66c141579aa9fa85003'), colour: 'blue', title: 'Further Task' },
				{ _id: new ObjectId('655ce66c141579aa9fa85004'), colour: 'purple', title: 'New Endpoint' },
				{ _id: new ObjectId('655ce66c141579aa9fa85005'), colour: 'yellow', title: 'Refactor' }
			],
			lists: [
				{
					_id: new ObjectId('655ce66c141579aa9fa85006'),
					header: 'Tasks',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa85007'),
							title: 'POST /api/users',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						},
						{
							_id: new ObjectId('655ce66c141579aa9fa85021'),
							title: 'GET /api/reviews (queries)',
							description: 'Lorem ipsum',
							assign: [],
							labels: [new ObjectId('655ce66c141579aa9fa85003'), new ObjectId('655ce66c141579aa9fa85005')]
						}
					]
				},
				{
					_id: new ObjectId('655ce66c141579aa9fa85008'),
					header: 'In progress',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa85009'),
							title: 'GET /api/reviews/:review_id',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85011')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						},
						{
							_id: new ObjectId('655ce66c141579aa9fa8500a'),
							title: 'POST /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85012'), new ObjectId('655ce66c141579aa9fa85013')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						}
					]
				},
				{
					_id: new ObjectId('655ce66c141579aa9fa8500b'),
					header: 'Code Review',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa8500c'),
							title: 'GET /api/reviews',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85014')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						}
					]
				},
				{
					_id: new ObjectId('655ce66c141579aa9fa8500d'),
					header: 'Done',
					cards: [
						{
							_id: new ObjectId('655ce66c141579aa9fa8500e'),
							title: 'GET /api/categories',
							description: 'Lorem ipsum',
							assign: [new ObjectId('655ce66c141579aa9fa85014')],
							labels: [new ObjectId('655ce66c141579aa9fa85002'), new ObjectId('655ce66c141579aa9fa85004')]
						}
					]
				}
			]
		}
		convertBoardObjectIdsToStrings(input)
		expect(input).toEqual(control)
	})
})

describe('addUserToWorkspace()', () => {
	test('returns a new object', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId()],
			boards: [new ObjectId()]
		}
		const output = addUserToWorkspace(workspace, new ObjectId())
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(workspace)
	})
	test('adds user ID users array', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3')],
			boards: [new ObjectId()]
		}
		const output = addUserToWorkspace(workspace, new ObjectId('65325f0b1423421bfa7277a4'))
		expect(output.users.some((userId) => userId.equals(new ObjectId('65325f0b1423421bfa7277a4')))).toBe(true)
	})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('65325f0b1423421bfa7277a2'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3')],
			boards: [new ObjectId('65325f0b1423421bfa7277a5')]
		}
		const control = {
			_id: new ObjectId('65325f0b1423421bfa7277a2'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3')],
			boards: [new ObjectId('65325f0b1423421bfa7277a5')]
		}
		addUserToWorkspace(input, new ObjectId('65325f0b1423421bfa7277a4'))
		expect(input).toEqual(control)
	})
})

describe('deleteUserFromWorkspace()', () => {
	test('returns a new object', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId()],
			boards: [new ObjectId()]
		}
		const output = deleteUserFromWorkspace(workspace, new ObjectId())
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(workspace)
	})
	test('removes user ID from users array', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3'), new ObjectId('65325f0b1423421bfa7277b4')],
			boards: [new ObjectId()]
		}
		const output = deleteUserFromWorkspace(workspace, new ObjectId('65325f0b1423421bfa7277b4'))
		expect(output.users.some((userId) => userId.equals(new ObjectId('65325f0b1423421bfa7277b4')))).toBe(false)
	})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('65325f0b1423421bfa7277b1'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3'), new ObjectId('65325f0b1423421bfa7277b4')],
			boards: [new ObjectId('65325f0b1423421bfa7277b5')]
		}
		const control = {
			_id: new ObjectId('65325f0b1423421bfa7277b1'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3'), new ObjectId('65325f0b1423421bfa7277b4')],
			boards: [new ObjectId('65325f0b1423421bfa7277b5')]
		}
		deleteUserFromWorkspace(input, new ObjectId('65325f0b1423421bfa7277b4'))
		expect(input).toEqual(control)
	})
})

describe('addBoardToWorkspace()', () => {
	test('return a new object', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Personal',
			users: [new ObjectId()],
			boards: [new ObjectId()]
		}
		const output = addBoardToWorkspace(workspace, new ObjectId())
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(workspace)
	})
	test('adds board ID to boards array', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
			boards: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Personal',
			users: [new ObjectId()],
			boards: [new ObjectId('65325f0b1423421bfa7277c5')]
		}
		const output = addBoardToWorkspace(workspace, new ObjectId('65325f0b1423421bfa7277c6'))
		expect(output.boards.some((boardId) => boardId.equals(new ObjectId('65325f0b1423421bfa7277c6')))).toBe(true)
	})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('65325f0b1423421bfa7277a1'),
			name: 'Personal',
			users: [new ObjectId('65325f0b1423421bfa7277b4')],
			boards: [new ObjectId('65325f0b1423421bfa7277c5')]
		}
		const control = {
			_id: new ObjectId('65325f0b1423421bfa7277a1'),
			name: 'Personal',
			users: [new ObjectId('65325f0b1423421bfa7277b4')],
			boards: [new ObjectId('65325f0b1423421bfa7277c5')]
		}
		addBoardToWorkspace(input, new ObjectId('65325f0b1423421bfa7277c6'))
		expect(input).toEqual(control)
	})
})
