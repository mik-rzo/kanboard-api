import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../src/app'
import { setup } from '../src/db/setup'
import { seed } from '../src/db/seed'
import { ObjectId } from 'mongodb'

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

describe('/api/workspaces', () => {
	describe('POST request', () => {
		test('status 201 - accepts object with workspace name and responds with added database entry', () => {
			interface LoginI {
				email: string
				password: string
			}
			interface WorkspaceI {
				workspaceName: string
			}
			const login: LoginI = {
				email: 'gabi.ramsay@example.com',
				password: '2Vbikjlwe7wo'
			}
			const workspace: WorkspaceI = {
				workspaceName: 'Buggy Bears'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).post('/api/workspaces').set('Cookie', cookie).send(workspace).expect(201)
				})
				.then((response) => {
					const { workspace } = response.body
					expect(workspace).toHaveProperty('_id')
					expect(workspace.name).toBe('Buggy Bears')
					expect(Array.isArray(workspace.users)).toBe(true)
					expect(workspace.users.length).toBe(1)
				})
		})
		test('status 400 - missing workspace name property', () => {
			interface LoginI {
				email: string
				password: string
			}
			const login: LoginI = {
				email: 'gabi.ramsay@example.com',
				password: '2Vbikjlwe7wo'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).post('/api/workspaces').set('Cookie', cookie).send({}).expect(400)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information.')
				})
		})
		test('status 401 - user is not authenticated', () => {
			interface WorkspaceI {
				workspaceName: string
			}
			const workspace: WorkspaceI = {
				workspaceName: 'Buggy Bears'
			}
			return request(app)
				.post('/api/workspaces')
				.send(workspace)
				.expect(401)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Not logged in.')
				})
		})
	})
	describe('/:workspace_id/name', () => {
		describe('PATCH request', () => {
			test('status 200 - accepts object with workspace name and updates workspace matching ID', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const login: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: WorkspaceI = {
					workspaceName: 'Buggy Bears'
				}
				const renameWorkspace: WorkspaceI = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postWorkspace = request(app).post('/api/workspaces').set('Cookie', cookie).send(workspace)
						return Promise.all([postWorkspace, cookie])
					})
					.then(([response, cookie]) => {
						const workspaceId = response.body.workspace._id
						return request(app)
							.patch(`/api/workspaces/${workspaceId}/name`)
							.set('Cookie', cookie)
							.send(renameWorkspace)
							.expect(200)
					})
					.then((response) => {
						const { workspace } = response.body
						expect(workspace).toHaveProperty('_id')
						expect(workspace.name).toBe('Agile Aces')
						expect(Array.isArray(workspace.users)).toBe(true)
					})
			})
			test('status 400 - missing workspace name property', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const login: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: WorkspaceI = {
					workspaceName: 'Buggy Bears'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postWorkspace = request(app).post('/api/workspaces').set('Cookie', cookie).send(workspace)
						return Promise.all([postWorkspace, cookie])
					})
					.then(([response, cookie]) => {
						const workspaceId = response.body.workspace._id
						return request(app).patch(`/api/workspaces/${workspaceId}/name`).set('Cookie', cookie).send({}).expect(400)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Missing required information.')
					})
			})
			test('status 401 - user is not authenticated', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const login: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: WorkspaceI = {
					workspaceName: 'Buggy Bears'
				}
				const renameWorkspace: WorkspaceI = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postWorkspace = request(app).post('/api/workspaces').set('Cookie', cookie).send(workspace)
						return Promise.all([postWorkspace, cookie])
					})
					.then(([response, cookie]) => {
						const workspaceId = response.body.workspace._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, workspaceId, cookie])
					})
					.then(([response, workspaceId, cookie]) => {
						return request(app)
							.patch(`/api/workspaces/${workspaceId}/name`)
							.set('Cookie', cookie)
							.send(renameWorkspace)
							.expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 403 - user does not have permission to change workspace name', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const loginGabi: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const loginZara: LoginI = {
					email: 'zara.russel@example.com',
					password: 'fddnQzxuqerp'
				}
				const workspace: WorkspaceI = {
					workspaceName: 'Buggy Bears'
				}
				const renameWorkspace: WorkspaceI = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginGabi)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postWorkspace = request(app).post('/api/workspaces').set('Cookie', cookie).send(workspace)
						return Promise.all([postWorkspace, cookie])
					})
					.then(([response, cookie]) => {
						const workspaceId = response.body.workspace._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const loginAsDifferentUser = request(app).post('/api/sessions').send(loginZara)
						return Promise.all([loginAsDifferentUser, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const cookie = response.headers['set-cookie']
						return request(app)
							.patch(`/api/workspaces/${workspaceId}/name`)
							.set('Cookie', cookie)
							.send(renameWorkspace)
							.expect(403)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not authorized.')
					})
			})
			test('status 404 - could not find workspace matching id', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const login: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const renameWorkspace: WorkspaceI = {
					workspaceName: 'Agile Aces'
				}
				const workspaceId = new ObjectId()
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app)
							.patch(`/api/workspaces/${workspaceId}/name`)
							.set('Cookie', cookie)
							.send(renameWorkspace)
							.expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Workspace matching ID not found.')
					})
			})
		})
	})
	describe('/:workspace_id/users', () => {
		describe('PATCH request', () => {
			test('status 200 - adds user ID from session to users array of workspace matching workspace ID', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const loginGabi: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const loginZara: LoginI = {
					email: 'zara.russel@example.com',
					password: 'fddnQzxuqerp'
				}
				const workspace: WorkspaceI = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginGabi)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postWorkspace = request(app).post('/api/workspaces').set('Cookie', cookie).send(workspace)
						return Promise.all([postWorkspace, cookie])
					})
					.then(([response, cookie]) => {
						const workspaceId = response.body.workspace._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const loginAsDifferentUser = request(app).post('/api/sessions').send(loginZara)
						return Promise.all([loginAsDifferentUser, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const cookie = response.headers['set-cookie']
						return request(app).patch(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie).expect(200)
					})
					.then((response) => {
						const { workspace } = response.body
						expect(workspace).toHaveProperty('_id')
						expect(workspace.name).toBe('Agile Aces')
						expect(Array.isArray(workspace.users)).toBe(true)
						expect(workspace.users.length).toBe(2)
					})
			})
			test('status 401 - user is not authenticated', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const login: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: WorkspaceI = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postWorkspace = request(app).post('/api/workspaces').set('Cookie', cookie).send(workspace)
						return Promise.all([postWorkspace, cookie])
					})
					.then(([response, cookie]) => {
						const workspaceId = response.body.workspace._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, workspaceId, cookie])
					})
					.then(([response, workspaceId, cookie]) => {
						return request(app).patch(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie).expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 404 - could not find workspace matching ID', () => {
				interface LoginI {
					email: string
					password: string
				}
				interface WorkspaceI {
					workspaceName: string
				}
				const login: LoginI = {
					email: 'gabi.ramsay@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: WorkspaceI = {
					workspaceName: 'Agile Aces'
				}
				const workspaceId = new ObjectId()
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app).patch(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie).expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Workspace matching ID not found.')
					})
			})
		})
	})
})
