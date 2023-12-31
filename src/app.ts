import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongodb-session'
import dotenv from 'dotenv'
import router from './routes/index.js'

const MongoDBStore = MongoStore(session)

const app = express()

app.use((request, response, next) => {
	if (request.method === 'PATCH') {
		request.headers['content-type'] = 'application/merge-patch+json'
	}
	next()
})

app.use(express.json({ type: ['application/json', 'application/merge-patch+json'] }))

dotenv.config({ path: new URL(`../../.env.${app.get('env')}`, import.meta.url) })

const sessionStore = new MongoDBStore(
	{
		uri:
			app.get('env') !== 'production'
				? `mongodb://localhost:27017/${process.env.MONGODB_DATABASE}`
				: process.env.MONGO_URL,
		collection: 'sessions'
	},
	function (error) {
		if (error) {
			console.log(error)
		}
	}
)

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		name: 'sessionID',
		cookie: {
			httpOnly: true,
			maxAge: 1000 * 60 * 30
		}
	})
)

if (app.get('env') === 'production') {
	app.set('trust proxy', 1)
	session.cookie.secure = true
	session.cookie.sameSite = 'none'
}

app.use('/', router)

app.use((error, request, response, next) => {
	if (error.code === 121) {
		response.status(400).send({ message: 'Missing required information in request body.' })
	} else {
		next(error)
	}
})

app.use((error, request, response, next) => {
	if (error.code === 400) {
		response.status(400).send({ message: error.message })
	} else {
		next(error)
	}
})

app.use((error, request, response, next) => {
	if (error.code === 401) {
		response.status(401).send({ message: error.message })
	} else {
		next(error)
	}
})

app.use((error, request, response, next) => {
	if (error.code === 403) {
		response.status(403).send({ message: error.message })
	} else {
		next(error)
	}
})

app.use((error, request, response, next) => {
	if (error.code === 404) {
		response.status(404).send({ message: error.message })
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
