import pool from './connection.js'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'

interface UserI {
	_id: ObjectId
	fullName: string
	email: string
	password: string
}

export async function seed() {
	const users: UserI[] = [
		{
			_id: new ObjectId('64f71c09bd22c8de14b39181'),
			fullName: 'Zara Russel',
			email: 'zara.russel@example.com',
			password: 'fddnQzxuqerp'
		},
		{
			_id: new ObjectId('64f71c09bd22c8de14b39182'),
			fullName: 'Gabi Ramsay',
			email: 'gabi.ramsay@example.com',
			password: '2Vbikjlwe7wo'
		},
		{
			_id: new ObjectId('64f71c09bd22c8de14b39183'),
			fullName: 'Saul Goodman',
			email: 'saul.goodman@example.com',
			password: 'imfeym7q9nwj'
		}
	]
	const db = await pool
	for (let i = 0; i < users.length; i++) {
		users[i].password = await bcrypt.hash(users[i].password, 5)
		await db.collection('workspaces').insertOne({
			name: 'Personal',
			users: [users[i]._id]
		})
	}
	await db.collection('users').insertMany(users)
}
