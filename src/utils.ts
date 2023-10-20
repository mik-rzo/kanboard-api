export function convertUserObjectIdsToString(user) {
	return {
		_id: user._id.toString(),
		fullName: user.fullName,
		email: user.email,
		password: user.password
	}
}

export function convertWorkspaceObjectIdsToString(workspace) {
	return {
		_id: workspace._id.toString(),
		name: workspace.name,
		users: workspace.users.map((userId) => {
			return userId.toString()
		})
	}
}

export function addUserToWorkspace(workspace, userId) {
	return { ...workspace, users: [...workspace.users, userId] }
}
