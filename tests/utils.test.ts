import { describe, test, expect } from 'vitest'
import { convertUserObjectIdsToString } from '../src/utils'
import { ObjectId } from 'mongodb'

describe('convertUserObjectIdsToString()', () => {
	test('returns a new object', () => {
		interface UserI {
			_id: ObjectId
			fullName: string
			email: string
			password: string
			workspaces: ObjectId[]
		}
		const user: UserI = {
			_id: new ObjectId(),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [new ObjectId(), new ObjectId()]
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
			workspaces: ObjectId[]
		}
		const user: UserI = {
			_id: new ObjectId(),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [new ObjectId(), new ObjectId()]
		}
		const output = convertUserObjectIdsToString(user)
		expect(output._id).toBeTypeOf('string')
		output.workspaces.forEach((workspaceId) => {
			expect(workspaceId).toBeTypeOf('string')
		})
	})
	test('does not mutate the object', () => {
		const input = {
			_id: new ObjectId('650b03752d79f6b6f822dae7'),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [new ObjectId('650b03752d79f6b6f822dae8'), new ObjectId('650b03752d79f6b6f822dae9')]
		}
		const control = {
			_id: new ObjectId('650b03752d79f6b6f822dae7'),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [new ObjectId('650b03752d79f6b6f822dae8'), new ObjectId('650b03752d79f6b6f822dae9')]
		}
		convertUserObjectIdsToString(input)
		expect(input).toEqual(control)
	})
})
