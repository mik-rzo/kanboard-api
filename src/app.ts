import express from 'express'
import router from './routes/index.js'

const app = express()

app.use(express.json())

app.use('/', router)

app.use((error, request, response, next) => {
	if (error.code === 121) {
		response.status(400).send({ message: 'Missing required information.' })
	} else {
		next(error)
	}
})

app.use((error, request, response, next) => {
	if (error.code === 11000) {
		response.status(409).send({ message: 'Account with this email already exists, please log in instead.' })
	} else {
		next(error)
	}
})

app.use((error, request, response, next) => {
	console.log(error)
	response.sendStatus(500)
})

export default app
