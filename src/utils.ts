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
		}),
		boards: workspace.boards.map((boardId) => {
			return boardId.toString()
		})
	}
}

export function addUserToWorkspace(workspace, userId) {
	return { ...workspace, users: [...workspace.users, userId] }
}

export function deleteUserFromWorkspace(workspace, userId) {
	return { ...workspace, users: workspace.users.filter((userIdElement) => !userIdElement.equals(userId)) }
}
