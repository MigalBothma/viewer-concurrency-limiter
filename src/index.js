const express = require('express')
let app = express();
app.use(express.json());

// Config
const config = require('./config')

// Schemas
const schemas = require('./schemas')

// AWS DynamoDB imports
const AWS = require("aws-sdk");

// Configure AWS DynamoDB
AWS.config.update({
  region: config.AWS_REGION,
  endpoint: config.AWSDYNAMODB_URI,
});
const dynamodb = new AWS.DynamoDB();

// Object Validation Framework
const Joi = require('joi');

//-------------------------------------------------
//------------------- canStream -------------------
//-------------------------------------------------
app.get( '/canStream/:UID', function (req, res) {
  const params = req.params
  const { error, value } = schemas.requestSchema.validate(params);

  // Guard Clause with obj validation
  if(error){ res.status(400).send({
    error: ",".join(error.details)
  })}

  res.send.status(200).send({

  })
});

//-------------------------------------------------
//------------------- endStream -------------------
//-------------------------------------------------
app.get( '/endStream/:UID', function (req, res) {
  res.send('hello world')
});

module.exports = app