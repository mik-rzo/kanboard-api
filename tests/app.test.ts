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
	interface PostUserRequestBody {
		fullName: string
		email: string
		password: string
	}
	describe('POST request', () => {
		interface PartialPostUserRequestBody extends Partial<PostUserRequestBody> {}
		test('status 201 - accepts user object and responds with added database entry', () => {
			const user: PostUserRequestBody = {
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
		test('status 400 - missing full name in request body', () => {
			const user: PartialPostUserRequestBody = {
				email: 'michael.panong@example.com',
				password: 'M3!qBsx7Sf8Hy6'
			}
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information in request body.')
				})
		})
		test('status 400 - missing email in request body', () => {
			const user: PartialPostUserRequestBody = {
				fullName: 'Michael Panong',
				password: 'M3!qBsx7Sf8Hy6'
			}
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information in request body.')
				})
		})
		test('status 400 - missing password in request body', () => {
			const user: PartialPostUserRequestBody = {
				fullName: 'Michael Panong',
				email: 'michael.panong@example.com'
			}
			return request(app)
				.post('/api/users')
				.send(user)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information in request body.')
				})
		})
		test('status 409 - email already exists in database', () => {
			const user: PostUserRequestBody = {
				fullName: 'Casper Nyström',
				email: 'casper.nystrom@example.com',
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
	interface PostSessionRequestBody {
		email: string
		password: string
	}
	describe('POST request', () => {
		interface PartialPostSessionRequestBody extends Partial<PostSessionRequestBody> {}
		test('status 201 - accepts valid login details then creates a new session in database and responds with session cookie', () => {
			const login: PostSessionRequestBody = {
				email: 'casper.nystrom@example.com',
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
		test('status 400 - missing email in request body', () => {
			const login: PartialPostSessionRequestBody = {
				password: 'imfeym7q9nwj'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing login details.')
				})
		})
		test('status 400 - missing password in request body', () => {
			const login: PartialPostSessionRequestBody = {
				email: 'casper.nystrom@example.com'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.expect(400)
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing login details.')
				})
		})
		test('status 401 - invalid login credentials (email does not exist in database)', () => {
			const login: PostSessionRequestBody = {
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
			const login: PostSessionRequestBody = {
				email: 'casper.nystrom@example.com',
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
			const login: PostSessionRequestBody = {
				email: 'jake.weston@example.com',
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
	interface LoginRequestBody {
		email: string
		password: string
	}
	interface PostWorkspaceRequestBody {
		workspaceName: string
	}
	interface PatchWorkspaceNameRequestBody {
		name: string
	}
	describe('POST request', () => {
		test('status 201 - accepts object with workspace name and responds with added database entry', () => {
			const login: LoginRequestBody = {
				email: 'lisa.chen@example.com',
				password: '2Vbikjlwe7wo'
			}
			const workspace: PostWorkspaceRequestBody = {
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
					expect(workspace.users).toContain('64f71c09bd22c8de14b39182')
				})
		})
		test('status 400 - missing workspace name in request body', () => {
			const login: LoginRequestBody = {
				email: 'lisa.chen@example.com',
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
					expect(message).toBe('Missing required information in request body.')
				})
		})
		test('status 401 - user is not authenticated', () => {
			const login: LoginRequestBody = {
				email: 'lisa.chen@example.com',
				password: '2Vbikjlwe7wo'
			}
			const workspace: PostWorkspaceRequestBody = {
				workspaceName: 'Buggy Bears'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
					return Promise.all([logout, cookie])
				})
				.then(([response, cookie]) => {
					return request(app).post('/api/workspaces').send(workspace).set('Cookie', cookie).expect(401)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Not logged in.')
				})
		})
	})
	describe('GET request', () => {
		test("status 200 - responds with logged in user's workspaces", () => {
			const login: LoginRequestBody = {
				email: 'lisa.chen@example.com',
				password: '2Vbikjlwe7wo'
			}
			const workspace: PostWorkspaceRequestBody = {
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
					return request(app).get('/api/workspaces').set('Cookie', cookie).expect(200)
				})
				.then((response) => {
					const { workspaces } = response.body
					expect(workspaces.length).toBe(2)
					expect(workspaces).toContainEqual({
						_id: expect.any(String),
						name: 'Personal',
						users: ['64f71c09bd22c8de14b39182']
					})
					expect(workspaces).toContainEqual({
						_id: expect.any(String),
						name: 'Buggy Bears',
						users: ['64f71c09bd22c8de14b39182']
					})
				})
		})
		test('status 401 - user is not authenticated', () => {
			const login: LoginRequestBody = {
				email: 'lisa.chen@example.com',
				password: '2Vbikjlwe7wo'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
					return Promise.all([logout, cookie])
				})
				.then(([response, cookie]) => {
					return request(app).get('/api/workspaces').set('Cookie', cookie).expect(401)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Not logged in.')
				})
		})
	})
	describe('/:workspace_id', () => {
		describe('DELETE request', () => {
			test('status 204 - workspace matching ID removed from database', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
						return Promise.all([
							request(app).delete(`/api/workspaces/${workspaceId}`).set('Cookie', cookie).expect(204),
							workspaceId,
							cookie
						])
					})
					.then(([response, workspaceId, cookie]) => {
						return request(app).delete(`/api/workspaces/${workspaceId}`).set('Cookie', cookie).expect(404)
					})
			})
			test('status 401 - user is not authenticated', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, workspaceId, cookie])
					})
					.then(([response, workspaceId, cookie]) => {
						return request(app).delete(`/api/workspaces/${workspaceId}`).set('Cookie', cookie).expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 404 - could not find workspace matching ID', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspaceId = new ObjectId()
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app).delete(`/api/workspaces/${workspaceId}`).set('Cookie', cookie).expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Workspace matching ID not found.')
					})
			})
			test('status 403 - user is not authorized to delete workspace', () => {
				const loginLisa: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const loginJake: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Buggy Bears'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginLisa)
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
						const loginAsDifferentUser = request(app).post('/api/sessions').send(loginJake)
						return Promise.all([loginAsDifferentUser, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const cookie = response.headers['set-cookie']
						return request(app).delete(`/api/workspaces/${workspaceId}`).set('Cookie', cookie).expect(403)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('User is not part of workspace.')
					})
			})
		})
		describe('PATCH request', () => {
			test('status 200 - accepts object with workspace name and updates workspace matching ID', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Buggy Bears'
				}
				const renameWorkspace: PatchWorkspaceNameRequestBody = {
					name: 'Agile Aces'
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
							.patch(`/api/workspaces/${workspaceId}`)
							.set('Cookie', cookie)
							.send(renameWorkspace)
							.expect(200)
					})
					.then((response) => {
						const { workspace } = response.body
						expect(workspace.name).toBe('Agile Aces')
					})
			})
			test('status 200 - ignores additional properties apart from "name"', () => {
				interface PatchWorkspaceRequestBody extends PatchWorkspaceNameRequestBody {
					_id?: string | null
					users?: string[] | null
					boards?: string[] | null
				}
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Buggy Bears'
				}
				const patchWorkspace: PatchWorkspaceRequestBody = {
					_id: null,
					name: 'Agile Aces',
					users: [new ObjectId().toString(), new ObjectId().toString()]
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
							.patch(`/api/workspaces/${workspaceId}`)
							.set('Cookie', cookie)
							.send(patchWorkspace)
							.expect(200)
					})
					.then((response) => {
						const { workspace } = response.body
						expect(workspace).toHaveProperty('_id')
						expect(workspace.name).toBe('Agile Aces')
						expect(workspace.users.length).toBe(1)
						expect(workspace.users).toContain('64f71c09bd22c8de14b39182')
					})
			})
			test('status 400 - missing workspace name in request body', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
						return request(app).patch(`/api/workspaces/${workspaceId}`).set('Cookie', cookie).send({}).expect(400)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Missing required information in request body.')
					})
			})
			test('status 401 - user is not authenticated', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Buggy Bears'
				}
				const renameWorkspace: PatchWorkspaceNameRequestBody = {
					name: 'Agile Aces'
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
							.patch(`/api/workspaces/${workspaceId}`)
							.set('Cookie', cookie)
							.send(renameWorkspace)
							.expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 403 - user is not authorized to change workspace name', () => {
				const loginLisa: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const loginJake: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Buggy Bears'
				}
				const renameWorkspace: PatchWorkspaceNameRequestBody = {
					name: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginLisa)
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
						const loginAsDifferentUser = request(app).post('/api/sessions').send(loginJake)
						return Promise.all([loginAsDifferentUser, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const cookie = response.headers['set-cookie']
						return request(app)
							.patch(`/api/workspaces/${workspaceId}`)
							.set('Cookie', cookie)
							.send(renameWorkspace)
							.expect(403)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('User is not part of workspace.')
					})
			})
			test('status 404 - could not find workspace matching id', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const renameWorkspace: PatchWorkspaceNameRequestBody = {
					name: 'Agile Aces'
				}
				const workspaceId = new ObjectId()
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app)
							.patch(`/api/workspaces/${workspaceId}`)
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
		describe('POST request', () => {
			test('status 200 - adds user ID from session to users array of workspace matching workspace ID', () => {
				const loginLisa: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const loginJake: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginLisa)
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
						const loginAsDifferentUser = request(app).post('/api/sessions').send(loginJake)
						return Promise.all([loginAsDifferentUser, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const cookie = response.headers['set-cookie']
						return request(app).post(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie).expect(200)
					})
					.then((response) => {
						const { workspace } = response.body
						expect(workspace.users).toContain('64f71c09bd22c8de14b39182')
						expect(workspace.users).toContain('64f71c09bd22c8de14b39181')
					})
			})
			test('status 200 - does not add duplicate user ID', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
						return request(app).post(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie).expect(200)
					})
					.then((response) => {
						const { workspace } = response.body
						expect(workspace.users.length).toBe(1)
					})
			})
			test('status 401 - user is not authenticated', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
						return request(app).post(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie).expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 404 - could not find workspace matching ID', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspaceId = new ObjectId()
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app).post(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie).expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Workspace matching ID not found.')
					})
			})
		})
	})
	describe('/:workspace_id/users/:user_id', () => {
		describe('DELETE request', () => {
			test('status 204 - user ID removed from users array of workspace matching workspace ID', () => {
				const loginLisa: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const loginJake: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginLisa)
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
						const loginAsDifferentUser = request(app).post('/api/sessions').send(loginJake)
						return Promise.all([loginAsDifferentUser, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const cookie = response.headers['set-cookie']
						const addUserToWorkspace = request(app).post(`/api/workspaces/${workspaceId}/users`).set('Cookie', cookie)
						return Promise.all([addUserToWorkspace, workspaceId, cookie])
					})
					.then(([response, workspaceId, cookie]) => {
						return Promise.all([
							request(app)
								.delete(`/api/workspaces/${workspaceId}/users/64f71c09bd22c8de14b39182`)
								.set('Cookie', cookie)
								.expect(204),
							workspaceId,
							cookie
						])
					})
					.then(([response, workspaceId, cookie]) => {
						const getUsersWorkspaces = request(app).get('/api/workspaces').set('Cookie', cookie)
						return Promise.all([getUsersWorkspaces, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const { workspaces } = response.body
						const workspace = workspaces.find((workspace) => workspace._id === workspaceId)
						expect(workspace.users).not.toContain('64f71c09bd22c8de14b39182')
					})
			})
			test('status 204 - workspace is deleted if the last user from users array is removed', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
						return Promise.all([
							request(app)
								.delete(`/api/workspaces/${workspaceId}/users/64f71c09bd22c8de14b39182`)
								.set('Cookie', cookie)
								.expect(204),
							workspaceId,
							cookie
						])
					})
					.then(([response, workspaceId, cookie]) => {
						return request(app).delete(`/api/workspaces/${workspaceId}`).set('Cookie', cookie).expect(404)
					})
			})
			test('status 401 - user is not authenticated', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
							.delete(`/api/workspaces/${workspaceId}/users/64f71c09bd22c8de14b39182`)
							.set('Cookie', cookie)
							.expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 403 - user is not authorized to remove a user from the workspace', () => {
				const loginLisa: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const loginJake: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const workspace: PostWorkspaceRequestBody = {
					workspaceName: 'Agile Aces'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginLisa)
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
						const loginAsDifferentUser = request(app).post('/api/sessions').send(loginJake)
						return Promise.all([loginAsDifferentUser, workspaceId])
					})
					.then(([response, workspaceId]) => {
						const cookie = response.headers['set-cookie']
						return request(app)
							.delete(`/api/workspaces/${workspaceId}/users/64f71c09bd22c8de14b39182`)
							.set('Cookie', cookie)
							.expect(403)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('User is not part of workspace.')
					})
			})
			test('status 404 - workspace matching ID could not be found', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspaceId = new ObjectId()
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app)
							.delete(`/api/workspaces/${workspaceId}/users/64f71c09bd22c8de14b39182`)
							.set('Cookie', cookie)
							.expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Workspace matching ID not found.')
					})
			})
			test('status 404 - workspace does not contain user matching user ID', () => {
				const login: LoginRequestBody = {
					email: 'lisa.chen@example.com',
					password: '2Vbikjlwe7wo'
				}
				const workspace: PostWorkspaceRequestBody = {
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
							.delete(`/api/workspaces/${workspaceId}/users/64f71c09bd22c8de14b39181`)
							.set('Cookie', cookie)
							.expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('User matching ID is not part of workspace.')
					})
			})
		})
	})
})

describe('/api/boards', () => {
	interface LoginRequestBody {
		email: string
		password: string
	}
	interface PostBoardRequestBody {
		boardName: string
		workspaceId: string
	}
	describe('POST request', () => {
		interface PartialPostBoardRequestBody extends Partial<PostBoardRequestBody> {}
		test('status 201 - accepts object with board name and workspace ID', () => {
			const login: LoginRequestBody = {
				email: 'jake.weston@example.com',
				password: 'fddnQzxuqerp'
			}
			const board: PostBoardRequestBody = {
				boardName: 'House of Games',
				workspaceId: '64f71c09bd22c8de14b39184'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).post('/api/boards').send(board).set('Cookie', cookie).expect(201)
				})
				.then((response) => {
					const { board } = response.body
					expect(board).toHaveProperty('_id')
					expect(board.name).toBe('House of Games')
					expect(board.workspace).toBe('64f71c09bd22c8de14b39184')
					expect(Array.isArray(board.labels)).toBe(true)
					expect(board.labels.length).toBe(0)
					expect(Array.isArray(board.lists)).toBe(true)
					expect(board.lists.length).toBe(0)
				})
		})
		test('status 401 - user is not authenticated', () => {
			const login: LoginRequestBody = {
				email: 'jake.weston@example.com',
				password: 'fddnQzxuqerp'
			}
			const board: PostBoardRequestBody = {
				boardName: 'House of Games',
				workspaceId: '64f71c09bd22c8de14b39184'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
					return Promise.all([logout, cookie])
				})
				.then(([response, cookie]) => {
					return request(app).post('/api/boards').send(board).set('Cookie', cookie).expect(401)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Not logged in.')
				})
		})
		test('status 400 - missing board name in request body', () => {
			const login: LoginRequestBody = {
				email: 'jake.weston@example.com',
				password: 'fddnQzxuqerp'
			}
			const board: PartialPostBoardRequestBody = {
				workspaceId: '64f71c09bd22c8de14b39184'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).post('/api/boards').send(board).set('Cookie', cookie).expect(400)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information in request body.')
				})
		})
		test('status 400 - missing workspace ID in request body', () => {
			const login: LoginRequestBody = {
				email: 'jake.weston@example.com',
				password: 'fddnQzxuqerp'
			}
			const board: PartialPostBoardRequestBody = {
				boardName: 'House of Games'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).post('/api/boards').send(board).set('Cookie', cookie).expect(400)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Missing required information in request body.')
				})
		})
		test('status 403 - user is not authorized to add board to workspace matching ID', () => {
			const login: LoginRequestBody = {
				email: 'jake.weston@example.com',
				password: 'fddnQzxuqerp'
			}
			const board: PostBoardRequestBody = {
				boardName: 'House of Games',
				workspaceId: '64f71c09bd22c8de14b39185'
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).post('/api/boards').send(board).set('Cookie', cookie).expect(403)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('User is not part of workspace.')
				})
		})
		test('status 404 - workspace matching ID could not be found', () => {
			const login: LoginRequestBody = {
				email: 'jake.weston@example.com',
				password: 'fddnQzxuqerp'
			}
			const board: PostBoardRequestBody = {
				boardName: 'House of Games',
				workspaceId: new ObjectId().toString()
			}
			return request(app)
				.post('/api/sessions')
				.send(login)
				.then((response) => {
					const cookie = response.headers['set-cookie']
					return request(app).post('/api/boards').send(board).set('Cookie', cookie).expect(404)
				})
				.then((response) => {
					const { message } = response.body
					expect(message).toBe('Workspace matching ID not found.')
				})
		})
	})
	describe('/:board_id/lists', () => {
		interface PostListRequestBody {
			listHeader: string
		}
		describe('POST request', () => {
			test('status 201 - accepts list header and adds list data to lists array of board matching board ID', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const list: PostListRequestBody = {
					listHeader: 'Core Tasks'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						return request(app).post(`/api/boards/${boardId}/lists`).set('Cookie', cookie).send(list).expect(201)
					})
					.then((response) => {
						const { board } = response.body
						expect(board.lists).toHaveLength(1)
						const list = board.lists[0]
						expect(list).toHaveProperty('_id')
						expect(list.header).toBe('Core Tasks')
						expect(Array.isArray(list.cards)).toBe(true)
						expect(list.cards.length).toBe(0)
					})
			})
			test('status 401 - user is not authenticated', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const list: PostListRequestBody = {
					listHeader: 'Core Tasks'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, boardId, cookie])
					})
					.then(([response, boardId, cookie]) => {
						return request(app).post(`/api/boards/${boardId}/lists`).set('Cookie', cookie).send(list).expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 400 - missing list title in request body', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						return request(app).post(`/api/boards/${boardId}/lists`).set('Cookie', cookie).send({}).expect(400)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Missing required information in request body.')
					})
			})
			test('status 404 - could not find board matching ID', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const boardId = new ObjectId().toString()
				const list: PostListRequestBody = {
					listHeader: 'Core Tasks'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app).post(`/api/boards/${boardId}/lists`).set('Cookie', cookie).send(list).expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Board matching ID not found.')
					})
			})
			test('status 403 - user is not authorized to edit board', () => {
				const loginJake: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const loginCasper: LoginRequestBody = {
					email: 'casper.nystrom@example.com',
					password: 'imfeym7q9nwj'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const list: PostListRequestBody = {
					listHeader: 'Core Tasks'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginJake)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, boardId, cookie])
					})
					.then(([response, boardId, cookie]) => {
						const login = request(app).post('/api/sessions').send(loginCasper)
						return Promise.all([login, boardId])
					})
					.then(([response, boardId]) => {
						const cookie = response.headers['set-cookie']
						return request(app).post(`/api/boards/${boardId}/lists`).set('Cookie', cookie).send(list).expect(403)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('User is not part of workspace.')
					})
			})
		})
	})
	describe(':/board_id/labels', () => {
		interface PostLabelRequestBody {
			labelColour:
				| '#4bce97'
				| '#f5cd47'
				| '#fea362'
				| '#f87168'
				| '#9f8fef'
				| '#85b8ff'
				| '#6cc3e0'
				| '#b3df72'
				| '#e774bb'
				| '#8590a2'
			labelTitle: string
		}
		describe('POST request', () => {
			interface PartialPostLabelRequestBody extends Partial<PostLabelRequestBody> {}
			test('status 201 - accepts colour and title then adds label to labels array of an existing board', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const label: PostLabelRequestBody = {
					labelColour: '#f87168',
					labelTitle: 'High'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						return request(app).post(`/api/boards/${boardId}/labels`).set('Cookie', cookie).send(label).expect(201)
					})
					.then((response) => {
						const { board } = response.body
						expect(board.labels).toHaveLength(1)
						const label = board.labels[0]
						expect(label).toHaveProperty('_id')
						expect(label.colour).toBe('#f87168')
						expect(label.title).toBe('High')
					})
			})
			test('status 401 - user is not authenticated', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const label: PostLabelRequestBody = {
					labelColour: '#f87168',
					labelTitle: 'High'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, boardId, cookie])
					})
					.then(([response, boardId, cookie]) => {
						return request(app).post(`/api/boards/${boardId}/labels`).set('Cookie', cookie).send(label).expect(401)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Not logged in.')
					})
			})
			test('status 400 - missing colour in request body', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const label: PartialPostLabelRequestBody = {
					labelTitle: 'High'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						return request(app).post(`/api/boards/${boardId}/labels`).set('Cookie', cookie).send(label).expect(400)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Missing required information in request body.')
					})
			})
			test('status 400 - missing title in request body', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const label: PartialPostLabelRequestBody = {
					labelColour: '#f87168'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						return request(app).post(`/api/boards/${boardId}/labels`).set('Cookie', cookie).send(label).expect(400)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Missing required information in request body.')
					})
			})
			test('status 404 - could not find board matching ID', () => {
				const login: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const boardId = new ObjectId().toString()
				const label: PostLabelRequestBody = {
					labelColour: '#f87168',
					labelTitle: 'High'
				}
				return request(app)
					.post('/api/sessions')
					.send(login)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						return request(app).post(`/api/boards/${boardId}/labels`).set('Cookie', cookie).send(label).expect(404)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('Board matching ID not found.')
					})
			})
			test('status 403 - user is not authorized to edit board', () => {
				const loginJake: LoginRequestBody = {
					email: 'jake.weston@example.com',
					password: 'fddnQzxuqerp'
				}
				const loginCasper: LoginRequestBody = {
					email: 'casper.nystrom@example.com',
					password: 'imfeym7q9nwj'
				}
				const board: PostBoardRequestBody = {
					boardName: 'House of Games',
					workspaceId: '64f71c09bd22c8de14b39184'
				}
				const label: PostLabelRequestBody = {
					labelColour: '#f87168',
					labelTitle: 'High'
				}
				return request(app)
					.post('/api/sessions')
					.send(loginJake)
					.then((response) => {
						const cookie = response.headers['set-cookie']
						const postBoard = request(app).post('/api/boards').set('Cookie', cookie).send(board)
						return Promise.all([postBoard, cookie])
					})
					.then(([response, cookie]) => {
						const boardId = response.body.board._id
						const logout = request(app).delete('/api/sessions').set('Cookie', cookie)
						return Promise.all([logout, boardId, cookie])
					})
					.then(([response, boardId, cookie]) => {
						const login = request(app).post('/api/sessions').send(loginCasper)
						return Promise.all([login, boardId])
					})
					.then(([response, boardId]) => {
						const cookie = response.headers['set-cookie']
						return request(app).post(`/api/boards/${boardId}/labels`).set('Cookie', cookie).send(label).expect(403)
					})
					.then((response) => {
						const { message } = response.body
						expect(message).toBe('User is not part of workspace.')
					})
			})
		})
	})
})
