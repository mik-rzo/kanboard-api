export function convertUserObjectIdsToStrings(user) {
	return {
		_id: user._id.toString(),
		fullName: user.fullName,
		email: user.email,
		password: user.password
	}
}

export function convertWorkspaceObjectIdsToStrings(workspace) {
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

export function convertBoardObjectIdsToStrings(board) {
	return {
		_id: board._id.toString(),
		name: board.name,
		labels: board.labels.map((label) => {
			return { ...label, _id: label._id.toString() }
		}),
		lists: board.lists.map((list) => {
			return {
				...list,
				_id: list._id.toString(),
				cards: list.cards.map((card) => {
					return {
						...card,
						_id: card._id.toString(),
						assign: card.assign.map((userId) => {
							return userId.toString()
						}),
						labels: card.labels.map((labelId) => {
							return labelId.toString()
						})
					}
				})
			}
		})
	}
}

export function addUserToWorkspace(workspace, userId) {
	return { ...workspace, users: [...workspace.users, userId] }
}

export function deleteUserFromWorkspace(workspace, userId) {
	return { ...workspace, users: workspace.users.filter((userIdElement) => !userIdElement.equals(userId)) }
}

export function addBoardToWorkspace(workspace, boardId) {
	return { ...workspace, boards: [...workspace.boards, boardId] }
}
