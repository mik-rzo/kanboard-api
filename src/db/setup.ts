import pool from './connection.js'

export async function setup() {
	const db = await pool
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
}