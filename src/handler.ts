const handler = require('serverless-express/handler')
const app = require('path/to/your/express/app')

module.exports.api = handler(app)