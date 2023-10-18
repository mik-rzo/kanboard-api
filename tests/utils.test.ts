import { describe, test, expect } from 'vitest'
import { convertUserObjectIdsToString, convertWorkspaceObjectIdsToString } from '../src/utils'
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
	test('does not mutate the object', () => {
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
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()]
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
		}
		const workspace: WorkspaceI = {
			_id: new ObjectId(),
			name: 'Buggy Bears',
			users: [new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId(), new ObjectId()]
		}
		const output = convertWorkspaceObjectIdsToString(workspace)
		expect(output._id).toBeTypeOf('string')
		output.users.forEach((userId) => {
			expect(userId).toBeTypeOf('string')
		})
	})
	test('does not mutate the object', () => {
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
		convertWorkspaceObjectIdsToString(input)
		expect(input).toEqual(control)
	})
})
