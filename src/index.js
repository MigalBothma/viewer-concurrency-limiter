const express = require('express')
let app = express();
app.use(express.json());

// Config
const cfg = require('./config')

// Schemas
const schemas = require('./schemas')

// AWS DynamoDB imports
const AWS = require("aws-sdk");

// Configure AWS DynamoDB
AWS.config.update({
  region: cfg.AWS_REGION,
  endpoint: cfg.AWSDYNAMODB_URI,
});
const dynamodb = new AWS.DynamoDB();

// Object Validation Framework
const Joi = require('joi');

// GET uid Data
function getUidData(uid){
  // Create a default object
  let item = {
    uid: null,
    count: 0
  }

  let params = {
    TableName: cfg.DYNAMODB_TABLE_NAME,
    Key: {
      'uid': {S: String(uid)}
    },
    ProjectionExpression: 'ATTRIBUTE_NAME'
  };

  // Call DynamoDB to read the item from the table
  dynamodb.getItem(params, function(err, data) {
    if (err) {
      if (err.code != "ResourceNotFoundException"){
        res.status(400).send({
          result: "error",
          message: String(error.code)
        })
      }
      // console.log("Error", err);
    } else {
      if (data.Item.uid) { item.uid = data.Item.uid }
      if (data.Item.count) { item.count = data.Item.count }
    }
  });

  return item
} 

// CREATE uid Data
function createUidData(uid){
  let item = {
    uid: null,
    count: 0
  }

  let params = {
    TableName: cfg.DYNAMODB_TABLE_NAME,
    Item: {
      'uid': {S: String(uid)}
    }
  };

  // Call DynamoDB to put the item in the table
  dynamodb.putItem(params, function(err, data) {
    if (err) {
      if (err){
        console.error(err); // Cloudwatch logs for time being
        res.status(400).send({
          result: "error",
          message: String(error.code)
        })
      }
    } else {
      item = data.Item;
      console.log("Success", data.Item);
    }
  });

  return item
} 

// Call DynamoDB to put the item in the table - putItem with same UID will update the key
function updateUidData(uid){
  // Create a default object
  let item = {
    uid: null,
    count: 0
  }

  // Construct Item to Update
  let params = {
    TableName: cfg.DYNAMODB_TABLE_NAME,
    Item: {
      'uid': {S: String(uid)}
    },
    ProjectionExpression: 'ATTRIBUTE_NAME'
  };

  // Call DynamoDB to read the item from the table
  dynamodb.putItem(params, function(err, data) {
    if (err) {
      if (err.code != "ResourceNotFoundException"){
        res.status(400).send({
          result: "error",
          message: String(error.code)
        })
      }
      // console.log("Error", err);
    } else {
      if (data.Item.uid) { item.uid = data.Item.uid }
      if (data.Item.count) { item.count = data.Item.count }
      console.log("Success", data.Item);
    }
  });
} 

//-------------------------------------------------
//------------------- canStream -------------------
//-------------------------------------------------
app.get( '/canStream/:uid', function (req, res) {
  const params = req.params
  const { error, value } = schemas.requestSchema.validate(params);

  // Guard Clause with obj validation
  if(error){ 
    res.status(400).send({
      result: "error",
      message: String(error.details.map(err => {return err.message} )) 
  })}

  // Define output
  let output = {
    result : "success",
    uid: "",
    canStream : false,
    streamCount: 0
  }

  //getUIDRecord
  const uidData = getUidData(params.uid)

  // If uid null, create
  if (!uidData.uid){
    output.uid = createUidData();
    output.streamCount += output.streamCount
    output.canStream = true;
    return output
  }

  console.log(output)

  // Return response
  res.status(200).send({
    
  })
});

//-------------------------------------------------
//------------------- endStream -------------------
//-------------------------------------------------
app.get( '/endStream/:uid', function (req, res) {
  res.send('hello world')
});

module.exports = app