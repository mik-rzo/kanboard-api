import pool from './connection.js'
import bcrypt from 'bcrypt'

interface UserI {
	fullName: string
	email: string
	password: string
}

const users: UserI[] = [
	{
		fullName: 'Zara Russel',
		email: 'zara.russel@example.com',
		password: 'fddnQzxuqerp'
	},
	{
		fullName: 'Gabi Ramsay',
		email: 'gabi.ramsay@example.com',
		password: '2Vbikjlwe7wo'
	},
	{
		fullName: 'Saul Goodman',
		email: 'saul.goodman@example.com',
		password: 'imfeym7q9nwj'
	}
]

export async function seed() {
	const db = await pool
	for (let i = 0; i < users.length; i++) {
		users[i].password = await bcrypt.hash(users[i].password, 10)
	}
	await db.collection('users').insertMany(users)
}
