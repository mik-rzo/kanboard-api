import { describe, test, expect } from 'vitest'
import {
	convertUserObjectIdsToStrings,
	convertWorkspaceObjectIdsToStrings,
	convertBoardObjectIdsToStrings,
	addElementToArray,
	removeElementFromArray
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
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()]
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
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()]
		}
		const output = convertWorkspaceObjectIdsToStrings(workspace)
		expect(output._id).toBeTypeOf('string')
		output.users.forEach((userId) => {
			expect(userId).toBeTypeOf('string')
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
			]
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
			]
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
			workspace: ObjectId
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
			workspace: new ObjectId(),
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
			workspace: ObjectId
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
			workspace: new ObjectId(),
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
		expect(output.workspace).toBeTypeOf('string')
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
			workspace: new ObjectId('655ce66c141579aa9fa85006'),
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
			workspace: new ObjectId('655ce66c141579aa9fa85006'),
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

describe('addElementToArray()', () => {
	test('returns a new object', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId()]
		}
		const output = addElementToArray(workspace, new ObjectId(), 'users')
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(workspace)
	})
	test('adds objectID to users array', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3')]
		}
		const output = addElementToArray(workspace, new ObjectId('65325f0b1423421bfa7277a4'), 'users')
		expect(output.users.some((userId) => userId.equals(new ObjectId('65325f0b1423421bfa7277a4')))).toBe(true)
	})
	test('adds object to lists array', () => {
		interface BoardI {
			_id: ObjectId
			name: string
			workspace: ObjectId
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
			workspace: new ObjectId(),
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
		const list: BoardI['lists'][0] = {
			_id: new ObjectId('659c02c13a1131d7b65f72e1'),
			header: 'Backlog',
			cards: []
		}
		const output = addElementToArray(board, list, 'lists')
		expect(output.lists).toContainEqual(list)
	})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('65325f0b1423421bfa7277a2'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3')]
		}
		const control = {
			_id: new ObjectId('65325f0b1423421bfa7277a2'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3')]
		}
		addElementToArray(input, new ObjectId('65325f0b1423421bfa7277a4'), 'users')
		expect(input).toEqual(control)
	})
})

describe('removeElementFromArray()', () => {
	test('returns a new object', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId()]
		}
		const output = removeElementFromArray(workspace, new ObjectId(), 'users')
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(workspace)
	})
	test('removes correct objectID from users array', () => {
		interface WorkspaceI {
			_id: ObjectId
			name: string
			users: ObjectId[]
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3'), new ObjectId('65325f0b1423421bfa7277b4')]
		}
		const output = removeElementFromArray(workspace, new ObjectId('65325f0b1423421bfa7277b4'), 'users')
		expect(output.users.some((userId) => userId.equals(new ObjectId('65325f0b1423421bfa7277b4')))).toBe(false)
	})
	test.skip('removes object with correct objectID from lists array', () => {})
	test('does not mutate the input', () => {
		const input = {
			_id: new ObjectId('65325f0b1423421bfa7277b1'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3'), new ObjectId('65325f0b1423421bfa7277b4')]
		}
		const control = {
			_id: new ObjectId('65325f0b1423421bfa7277b1'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3'), new ObjectId('65325f0b1423421bfa7277b4')]
		}
		removeElementFromArray(input, new ObjectId('65325f0b1423421bfa7277b4'), 'users')
		expect(input).toEqual(control)
	})
})
