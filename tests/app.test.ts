import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../src/app'
import { setup } from '../src/db/setup'
import { seed } from '../src/db/seed'

beforeEach(() => {
	return setup()
})

afterAll(() => {
	return setup().then(() => {
		return seed()
	})
})

describe('/api/users', () => {
	describe('POST request', () => {
		test('status 201 - accepts user object and responds with added database entry', async () => {
			interface UserI {
				fullName: string
				email: string
				password: string
			}
			const user: UserI = {
				fullName: 'Michael Panong',
				email: 'michael.panong@example.com',
				password: 'M3!qBsx7Sf8Hy6'
			}
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(201)
				.then((response) => {
					const { user } = response.body
					expect(user).toHaveProperty('_id')
					expect(user.fullName).toBe('Michael Panong')
					expect(user.email).toBe('michael.panong@example.com')
					expect(user.password).not.toBe('M3!qBsx7Sf8Hy6')
				})
		})
		test('status 400 - missing full name', () => {
			interface UserI {
				fullName?: string
				email?: string
				password?: string
			}
			const user: UserI = {
				email: 'michael.panong@example.com',
				password: 'M3!qBsx7Sf8Hy6'
			}
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information.')
				})
		})
		test('status 400 - missing email', () => {
			interface UserI {
				fullName?: string
				email?: string
				password?: string
			}
			const user: UserI = {
				fullName: 'Michael Panong',
				password: 'M3!qBsx7Sf8Hy6'
			}
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information.')
				})
		})
		test('status 400 - missing password', () => {
			interface UserI {
				fullName?: string
				email?: string
				password?: string
			}
			const user: UserI = {
				fullName: 'Michael Panong',
				email: 'michael.panong@example.com'
			}
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information.')
				})
		})
		test('status 409 - email already exists in database', () => {
			interface UserI {
				fullName: string
				email: string
				password: string
			}
			const user: UserI = {
				fullName: 'Saul Goodman',
				email: 'saul.goodman@example.com',
				password: 'imfeym7q9nwj'
			}
			return seed()
				.then(() => {
					return request(app).post('/api/users').send(user).expect(409)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Account with this email already exists, please log in instead.')
				})
		})
	})
})
