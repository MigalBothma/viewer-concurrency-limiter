// Express Imports
const serverless = require('serverless-http');
const express = require('express')
const app = require('./src/index');

module.exports.handler = serverless(app);