// Config
const config = require('./config')

var AWS = require("aws-sdk");

AWS.config.update({
    region: config.AWS_REGION,
    endpoint: config.AWS_DYNAMODB_URI,
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "uid_concurrency_count",
    KeySchema: [       
        { AttributeName: "uid", KeyType: "HASH"}
    ],
    AttributeDefinitions: [       
        { AttributeName: "uid", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 1, 
        WriteCapacityUnits: 1
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

function createDynamoDBTable() {
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

module.exports = {
    createDynamoDBTable
}