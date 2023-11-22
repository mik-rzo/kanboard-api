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
			fullName: 'Jake Weston',
			email: 'jake.weston@example.com',
			password: 'fddnQzxuqerp'
		},
		{
			_id: new ObjectId('64f71c09bd22c8de14b39182'),
			fullName: 'Lisa Chen',
			email: 'lisa.chen@example.com',
			password: '2Vbikjlwe7wo'
		},
		{
			_id: new ObjectId('64f71c09bd22c8de14b39183'),
			fullName: 'Casper Nyström',
			email: 'casper.nystrom@example.com',
			password: 'imfeym7q9nwj'
		}
	]
	const db = await pool
	for (let i = 0; i < users.length; i++) {
		users[i].password = await bcrypt.hash(users[i].password, 5)
		const personalWorkspaceId = '64f71c09bd22c8de14b3918' + `${4 + i}`
		await db.collection('workspaces').insertOne({
			_id: new ObjectId(personalWorkspaceId),
			name: 'Personal',
			users: [users[i]._id],
			boards: []
		})
	}
	await db.collection('users').insertMany(users)
}
