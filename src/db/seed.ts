import pool from './connection.js'

interface UserI {
	fullName: string
	email: string
	password: string
}

const users: UserI[] = [
	{
		fullName: 'Yasmine Quirke',
		email: 'yasmine.quirke@example.com',
		password: 'unhashed-6qpcyoMlT0df'
	},
	{
		fullName: 'Adrian Morgan',
		email: 'adrian.morgan@example.com',
		password: 'unhashed-wvujwPzhp9Ib'
	},
	{
		fullName: 'Zara Russel',
		email: 'zara.russel@example.com',
		password: 'unhashed-fddnQzxuqerp'
	},
	{
		fullName: 'Gabi Ramsay',
		email: 'gabi.ramsay@example.com',
		password: 'unhashed-2Vbikjlwe7wo'
	},
	{
		fullName: 'Saul Goodman',
		email: 'saul.goodman@example.com',
		password: 'unhashed-imfeym7q9nwj'
	}
]

export async function seed() {
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
	await db.collection('users').insertMany(users)
}
