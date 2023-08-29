import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
const ENV = process.env.NODE_ENV || 'development'

dotenv.config({ path: new URL(`../../.env.${ENV}`, import.meta.url) })

if (!process.env.MONGODB_DATABASE) {
	throw new Error('MONGODB_DATABASE not set')
}

const client = new MongoClient('mongodb://localhost:27017/')

const pool = client.connect().then((client) => {
	return client.db(ENV !== 'production' ? `${process.env.MONGODB_DATABASE}` : `${process.env.MONGO_URL}`)
})

export default pool
