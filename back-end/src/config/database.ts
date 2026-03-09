import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL as string

const sql = postgres(connectionString, { ssl: 'require' })

export default sql