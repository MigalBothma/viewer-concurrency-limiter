// Express
const express = require('express')
let app = express();
app.use(express.json());

// Lodash
var _ = require('lodash');

// Config
const cfg = require('./config')
const createTable = require('./createTable')

// Schemas
const Joi = require('joi');
const schemas = require('./schemas')

// AWS DynamoDB imports
const AWS = require("aws-sdk");

// Configure AWS DynamoDB
AWS.config.update({
  region: cfg.AWS_REGION,
  endpoint: cfg.AWS_DYNAMODB_URI,
});
let docClient = new AWS.DynamoDB.DocumentClient();

//-------------------------------------------------
//--------------- Helper Functions ----------------
//-------------------------------------------------

//-------------------------------------------------
// GET UID Data
//-------------------------------------------------
async function getUidData(uid){
  let params = {
    TableName: cfg.DYNAMODB_TABLE_NAME,
    Key: {
      "uid": String(uid)
    }
  };

  // Call DynamoDB to read the item from the table
  let result = await docClient.get(params).promise()

  return result
} 

//-------------------------------------------------
// CREATE UID Data
//-------------------------------------------------
async function createUidData(uid, streamCount){
  console.log(uid, streamCount)

  let item =  {
    uid: uid ? uid : null,
    streamCount: streamCount
  }

  let params = {
    TableName: cfg.DYNAMODB_TABLE_NAME,
    Item: {
      uid: String(uid),
      streamCount: Number(streamCount)
    }
  };

  // Call DynamoDB to put the item in the table
  let result = await docClient.put(params).promise()
  return result
} 

//-------------------------------------------------
// UPDATE UID Data
//-------------------------------------------------
async function updateUidData(uid, streamCount){
  let params = {
    TableName: cfg.DYNAMODB_TABLE_NAME,
    Key: {
      "uid": String(uid)
    },
    UpdateExpression: "set streamCount = :v",
    ExpressionAttributeValues:{
        ":v":Number(streamCount)
    },
    ReturnValues:"UPDATED_NEW"
  };

  // Call DynamoDB to read the item from the table
  let result = await docClient.update(params).promise()

  return result
} 

//-------------------------------------------------
//------------------- canStream -------------------
//-------------------------------------------------
app.get( '/canStream/:uid', function (req, res) {
  const params = req.params;
  const { schema_err, value } = schemas.requestSchema.validate(params);
  
  // Guard Clause with obj validation
  if(schema_err){
    res.status(400).send({
      result: "error",
      message: String(schema_err.details.map(_err => {return _err.message} )) 
  })}

  // Define output
  let output = {
    result : "success",
    uid: "",
    canStream : false,
    streamCount: 0
  }

  output.uid = String(params.uid);

  //getUIDRecord
  getUidData(output.uid)
  .then(data => {
    if(data){
      console.log(data)

      // If we don't have an item
      if(_.isEmpty(data.Item)){
        output.canStream = true;
        output.streamCount = 1;
        // Create new uid and add 1 stream count
        createUidData(output.uid, output.streamCount);
        return res.status(200).send(output);
      } 

      // If we have an Item and count < 3
      if(data.Item.streamCount < cfg.CONCURRENT_SESSIONS){
        output.canStream = true;
        output.streamCount = data.Item.streamCount + 1
        updateUidData(output.uid, output.streamCount)
        return res.status(200).send(output);
      }

      // If we have an Item and count >= 3
      if(data.Item.streamCount >= cfg.CONCURRENT_SESSIONS) {
        output.canStream = false;
        output.streamCount = data.Item.streamCount
        updateUidData(output.uid, output.streamCount)
        return res.status(200).send(output);
      }
    }    
  })
  .catch( err => {
    console.error(err)
    if (err){
      // IF db doesn't exist
      if (err.code == 'ResourceNotFoundException'){
        console.log('Database Instance not Found. Attempting to create.')
        createTable.createDynamoDBTable()
      } 

      res.status(500).send({
        result: "error",
        message: err
      })
    }
  })
});

//-------------------------------------------------
//------------------- endStream -------------------
//-------------------------------------------------
app.get( '/endStream/:uid', function (req, res) {
  const params = req.params;
  const { schema_err, value } = schemas.requestSchema.validate(params);

  // Guard Clause with obj validation
  if(schema_err){ 
    res.status(400).send({
      result: "error",
      message: String(schema_err.details.map(_err => {return _err.message} )) 
  })}

  // Define output
  let output = {
    result : "success",
    uid: "",
    removedStream : false,
    streamCount: 0
  }

  output.uid = String(params.uid);

  //getUIDRecord
  getUidData(output.uid)
  .then(data => {
    if(data){
      console.log(data)

      // If we don't have an item
      if(_.isEmpty(data.Item)){
        output.removedStream = false;
        output.streamCount = 0;
        return res.status(200).send(output);
      }

      // If we have an Item
      if(data.Item.streamCount){
        output.removedStream = true;
        if(data.Item.streamCount){output.streamCount = data.Item.streamCount - 1;}
        updateUidData(output.uid, output.streamCount)
        return res.status(200).send(output);
      }
    }    
  })
  .catch( err => {
    console.error(err)
    if (err){
      res.status(500).send({
        result: "error",
        message: err
      })
    }
  })
});

module.exports = app