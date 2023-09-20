import { describe, test, expect } from 'vitest'
import { convertUserObjectIdsToString } from '../src/utils'
import { ObjectId } from 'mongodb'

describe('convertUserObjectIdsToString()', () => {
	test('returns a new object', () => {
		interface WorkspaceI {
			workspaceId: ObjectId
			workspaceName: string
		}
		interface UserI {
			_id: ObjectId
			fullName: string
			email: string
			password: string
			workspaces: WorkspaceI[]
		}
		const user: UserI = {
			_id: new ObjectId(),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [
				{
					workspaceId: new ObjectId(),
					workspaceName: 'Personal'
				},
				{
					workspaceId: new ObjectId(),
					workspaceName: 'Buggy Bears'
				}
			]
		}
		const output = convertUserObjectIdsToString(user)
		expect(output).toBeTypeOf('object')
		expect(Array.isArray(output)).toBe(false)
		expect(output).not.toBe(user)
	})
	test('converts all objectIds to strings', () => {
		interface WorkspaceI {
			workspaceId: ObjectId
			workspaceName: string
		}
		interface UserI {
			_id: ObjectId
			fullName: string
			email: string
			password: string
			workspaces: WorkspaceI[]
		}
		const user: UserI = {
			_id: new ObjectId(),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [
				{
					workspaceId: new ObjectId(),
					workspaceName: 'Personal'
				},
				{
					workspaceId: new ObjectId(),
					workspaceName: 'Buggy Bears'
				}
			]
		}
		const output = convertUserObjectIdsToString(user)
		expect(output._id).toBeTypeOf('string')
		output.workspaces.forEach((workspace) => {
			expect(workspace.workspaceId).toBeTypeOf('string')
		})
	})
	test('does not mutate the object', () => {
		const input = {
			_id: new ObjectId('650b03752d79f6b6f822dae7'),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [
				{
					workspaceId: new ObjectId('650b03752d79f6b6f822dae8'),
					workspaceName: 'Personal'
				},
				{
					workspaceId: new ObjectId('650b03752d79f6b6f822dae9'),
					workspaceName: 'Buggy Bears'
				}
			]
		}
		const control = {
			_id: new ObjectId('650b03752d79f6b6f822dae7'),
			fullName: 'Michael Panong',
			email: 'michael.panong@example.com',
			password: '$2b$10$4cw3lzkZiAcO4SrvuVjpQe/p1nH4z/6EtTob1AcWQy9o5n7CWIoRa',
			workspaces: [
				{
					workspaceId: new ObjectId('650b03752d79f6b6f822dae8'),
					workspaceName: 'Personal'
				},
				{
					workspaceId: new ObjectId('650b03752d79f6b6f822dae9'),
					workspaceName: 'Buggy Bears'
				}
			]
		}
		convertUserObjectIdsToString(input)
		expect(input).toEqual(control)
	})
})
