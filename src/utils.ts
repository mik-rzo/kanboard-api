export function convertUserObjectIdsToString(user) {
	return {
		_id: user._id.toString(),
		fullName: user.fullName,
		email: user.email,
		password: user.password,
		workspaces: user.workspaces.map((workspace) => {
			return { ...workspace, workspaceId: workspace.workspaceId.toString() }
		})
	}
}
