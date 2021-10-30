// Will be replaced with env vars
const PORT = 3000
const AWS_REGION = "af-south-1"
const AWS_DYNAMODB_URI = "http://localhost:8000"
const DYNAMODB_TABLE_NAME = "uid_concurrency_count"

module.exports = {
    PORT,
    AWS_REGION,
    AWS_DYNAMODB_URI,
    DYNAMODB_TABLE_NAME
}