import pool from './connection.js'

export async function setup() {
	const db = await pool
	await db.collection('sessions').drop()
	await db.collection('workspaces').drop()
	await db.collection('users').drop()
	await db.createCollection('users', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				title: 'User Object Validation',
				required: ['fullName', 'email', 'password'],
				properties: {
					fullName: {
						bsonType: 'string',
						description: "'name' must be a string and is required"
					},
					email: {
						bsonType: 'string',
						description: "'email' must be a string and is required"
					},
					password: {
						bsonType: 'string',
						description: "'password' must be a string and is required"
					}
				}
			}
		}
	})
	await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_' })
	await db.createCollection('workspaces', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				title: 'Workspace Object Validation',
				required: ['name', 'users', 'boards'],
				properties: {
					name: {
						bsonType: 'string',
						description: "'name' must be a string and is required"
					},
					users: {
						bsonType: 'array',
						description: "'users' must be an array and is required",
						items: {
							bsonType: 'objectId'
						}
					},
					boards: {
						bsonType: 'array',
						description: '"boards" must be an array and is required',
						items: {
							bsonType: 'objectId'
						}
					}
				}
			}
		}
	})
}
