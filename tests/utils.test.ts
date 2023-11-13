import { describe, test, expect } from 'vitest'
import {
	convertUserObjectIdsToString,
	convertWorkspaceObjectIdsToString,
	addUserToWorkspace,
	deleteUserFromWorkspace
} from '../src/utils'
import { ObjectId } from 'mongodb'

describe('convertUserObjectIdsToString()', () => {
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
		const output = convertUserObjectIdsToString(user)
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
		const output = convertUserObjectIdsToString(user)
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
		convertUserObjectIdsToString(input)
		expect(input).toEqual(control)
	})
})

describe('convertWorkspaceObjectIdsToString()', () => {
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
		const output = convertWorkspaceObjectIdsToString(workspace)
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
		const output = convertWorkspaceObjectIdsToString(workspace)
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
		convertWorkspaceObjectIdsToString(input)
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
	test('adds a new user ID to the users array', () => {
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
			boards: [new ObjectId('65325f0b1423421bfa7277a4')]
		}
		const control = {
			_id: new ObjectId('65325f0b1423421bfa7277a2'),
			name: 'Buggy Bears',
			users: [new ObjectId('65325f0b1423421bfa7277a3')],
			boards: [new ObjectId('65325f0b1423421bfa7277a4')]
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
