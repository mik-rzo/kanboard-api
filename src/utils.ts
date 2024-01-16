import { ObjectId } from 'mongodb'

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
		})
	}
}

export function convertBoardObjectIdsToStrings(board) {
	return {
		_id: board._id.toString(),
		name: board.name,
		workspace: board.workspace.toString(),
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

export function addElementToArray(object, element, key) {
	return { ...object, [key]: [...object[key], element] }
}

export function removeElementFromArray(object, element, key) {
	return {
		...object,
		[key]: object[key].filter((value) =>
			value instanceof ObjectId ? !value.equals(element) : !value._id.equals(element)
		)
	}
}
