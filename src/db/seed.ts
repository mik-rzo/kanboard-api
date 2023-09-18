import pool from './connection.js'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'

interface WorkspaceI {
	workspaceId: ObjectId
	workspaceName: string
}

interface UserI {
	fullName: string
	email: string
	password: string
	workspaces: WorkspaceI[]
}

export async function seed() {
	const users: UserI[] = [
		{
			fullName: 'Zara Russel',
			email: 'zara.russel@example.com',
			password: 'fddnQzxuqerp',
			workspaces: [
				{
					workspaceId: new ObjectId(),
					workspaceName: 'Personal'
				}
			]
		},
		{
			fullName: 'Gabi Ramsay',
			email: 'gabi.ramsay@example.com',
			password: '2Vbikjlwe7wo',
			workspaces: [
				{
					workspaceId: new ObjectId(),
					workspaceName: 'Personal'
				}
			]
		},
		{
			fullName: 'Saul Goodman',
			email: 'saul.goodman@example.com',
			password: 'imfeym7q9nwj',
			workspaces: [
				{
					workspaceId: new ObjectId(),
					workspaceName: 'Personal'
				}
			]
		}
	]
	const db = await pool
	for (let i = 0; i < users.length; i++) {
		users[i].password = await bcrypt.hash(users[i].password, 5)
	}
	await db.collection('users').insertMany(users)
}
