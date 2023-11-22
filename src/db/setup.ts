import pool from './connection.js'

export async function setup() {
	const db = await pool
	await db.collection('sessions').drop()
	await db.collection('boards').drop()
	await db.collection('workspaces').drop()
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
						description: 'must be a string and is required'
					},
					email: {
						bsonType: 'string',
						description: 'must be a string and is required'
					},
					password: {
						bsonType: 'string',
						description: 'must be a string and is required'
					}
				}
			}
		}
	})
	await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_' })
	await db.createCollection('workspaces', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				title: 'Workspace Object Validation',
				required: ['name', 'users', 'boards'],
				properties: {
					name: {
						bsonType: 'string',
						description: 'must be a string and is required'
					},
					users: {
						bsonType: 'array',
						description: 'must be an array and is required',
						items: {
							bsonType: 'objectId',
							description: 'must be an objectId'
						}
					},
					boards: {
						bsonType: 'array',
						description: 'must be an array and is required',
						items: {
							bsonType: 'objectId',
							description: 'must be an objectId'
						}
					}
				}
			}
		}
	})
	await db.createCollection('boards', {
		validator: {
			$jsonSchema: {
				bsonType: 'object',
				title: 'Board Object Validation',
				required: ['name', 'labels', 'lists'],
				properties: {
					name: {
						bsonType: 'string',
						description: 'must be a string and is required'
					},
					labels: {
						bsonType: 'array',
						description: 'must be an array and is required',
						items: {
							bsonType: 'object',
							required: ['_id', 'colour', 'title'],
							properties: {
								_id: {
									bsonType: 'objectId',
									description: 'must be an objectId and is required'
								},
								colour: {
									bsonType: 'string',
									description: 'must be a string and is required'
								},
								title: {
									bsonType: 'string',
									description: 'must be a string and is required'
								}
							}
						}
					},
					lists: {
						bsonType: 'array',
						description: 'must be an array and is required',
						items: {
							bsonType: 'object',
							required: ['_id', 'header', 'cards'],
							properties: {
								_id: {
									bsonType: 'objectId',
									description: 'must be an objectId and is required'
								},
								header: {
									bsonType: 'string',
									description: 'must be a string and is required'
								},
								cards: {
									bsonType: 'array',
									description: 'must be an array and is required',
									items: {
										bsonType: 'object',
										required: ['_id', 'title', 'description', 'assign', 'labels'],
										properties: {
											_id: {
												bsonType: 'objectId',
												description: 'must be an objectId and is required'
											},
											title: {
												bsonType: 'string',
												description: 'must be a string and is required'
											},
											description: {
												bsonType: 'string',
												description: 'must be a string and is required'
											},
											assign: {
												bsonType: 'array',
												description: 'must be an array and is required',
												items: {
													bsonType: 'objectId',
													description: 'must be an objectId'
												}
											},
											labels: {
												bsonType: 'array',
												description: 'must be an array and is required',
												items: {
													bsonType: 'objectId',
													description: 'must be an objectId'
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	})
}
