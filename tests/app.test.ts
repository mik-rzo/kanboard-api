import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../src/app'
import { setup } from '../src/db/setup'
import { seed } from '../src/db/seed'

beforeEach(() => {
	return setup().then(() => {
		return seed()
	})
})

afterAll(() => {
	return setup()
})

describe('/api/users', () => {
	describe('POST request', () => {
		test('status 201 - accepts user object and responds with added database entry', () => {
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
					expect(user.workspaces[0]).toHaveProperty('workspaceId')
					expect(user.workspaces[0].workspaceName).toBe('Personal')
				})
		})
		test('status 400 - missing full name property', () => {
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
		test('status 400 - missing email property', () => {
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
		test('status 400 - missing password property', () => {
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
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(409)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Account with this email already exists, please log in instead.')
				})
		})
	})
})

describe('/api/sessions', () => {
	describe('POST request', () => {
		test('status 201 - accepts valid login details then creates a new session in database and responds with session cookie', () => {
			interface LoginI {
				email: string
				password: string
			}
			const login: LoginI = {
				email: 'saul.goodman@example.com',
				password: 'imfeym7q9nwj'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.expect(201)
				.then((response) => {
					expect(response.header).toHaveProperty('set-cookie')
					const cookie = response.headers['set-cookie'][0]
					expect(/(?:sessionID)/.test(cookie)).toBe(true)
				})
		})
		test('status 400 - missing email property', () => {
			interface LoginI {
				email?: string
				password?: string
			}
			const login: LoginI = {
				password: 'imfeym7q9nwj'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing email or password.')
				})
		})
		test('status 400 - missing password property', () => {
			interface LoginI {
				email?: string
				password?: string
			}
			const login: LoginI = {
				email: 'saul.goodman@example.com'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing email or password.')
				})
		})
		test('status 401 - invalid login credentials (email does not exist in database)', () => {
			interface LoginI {
				email: string
				password: string
			}
			const login: LoginI = {
				email: 'michael.panong@example.com',
				password: 'M3!qBsx7Sf8Hy6'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.expect(401)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Incorrect email or password.')
				})
		})
		test('status 401 - invalid login credentials (wrong password)', () => {
			interface LoginI {
				email: string
				password: string
			}
			const login: LoginI = {
				email: 'saul.goodman@example.com',
				password: 'wrong-password'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.expect(401)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Incorrect email or password.')
				})
		})
	})
	describe('DELETE request', () => {
		test("status 204 - deletes session in database if there's a valid user session", () => {
			interface LoginI {
				email: string
				password: string
			}
			const login: LoginI = {
				email: 'zara.russel@example.com',
				password: 'fddnQzxuqerp'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).delete('/api/sessions').set('Cookie', cookie).expect(204)
				})
		})
		test('status 401 - no user session cookie', () => {
			return request(app)
				.delete('/api/sessions')
				.expect(401)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Already logged out.')
				})
		})
		test('status 401 - invalid user session cookie', () => {
			const cookie = [
				'sessionID=s%3Af9YDKTyW9u8QfZ-BUE0ShB55xCyTHVWe.f4yLgIRg5vqn5wU1w0nnZYZxsYt98WnTHoQuLVhEfBE; Path=/; Expires=Mon, 18 Sep 2023 14:59:39 GMT; HttpOnly'
			]
			return request(app)
				.delete('/api/sessions')
				.set('Cookie', cookie)
				.expect(401)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Already logged out.')
				})
		})
	})
})
