# Viewer Stream Concurrency Limiter

This function is written to limit the amount of streams a given user currently has open.
The API consumer will pass in a Unique ID ( this can be userName, accountName, accountID ) and it will track and increment/decrement the UID if a stream opens/closes.

## Service lifecycle
Before the external provider serves the stream this service is called to verify if the user has more than 3 streams open.

If the current stream count is < 3, the consumer will be allowed to proceed with the next stream : `canStream - true`.
```
{
    "result": "success",
    "uid": "96712348-12458908",
    "canStream": true,
    "streamCount": 1
}
```

If the current stream count is >=3, don't allow the user to proceed : `canStream - false`.
```
{
    "result": "success",
    "uid": "96712348-12458908",
    "canStream": false,
    "streamCount": 3
}
```

** The browser should house an onClose() lifecycle hook to call the endStream. Websockets can solve the issue of auto-disconnect but will hold function open until stream ends.

## Requirements
NodeJS
Docker *Local testing
AWS CLI

## Design
Functions to be housed as AWS Lambda ( Horizontal scaling ) and stateless ( config injection only ).
DynamoDB is used as DB. For Demo purposes will use docker container with DynamoDB.

## Framework
Express

## DB
AWS DynamoDB (Prod) / DynamoDB-local (Dev) (https://hub.docker.com/r/amazon/dynamodb-local)

## Deployment Target
AWS Lambda ( Serverless for describing the config + deployment )

## Monitoring (Prod)
AWS XRay for NodeJS + Express

### Local development
1. Pull the DynamoDB docker img. `docker run -p 8000:8000 amazon/dynamodb-local`
```
$docker pull amazon/dynamodb-local
Using default tag: latest
latest: Pulling from amazon/dynamodb-local
2cbe74538cb5: Pull complete
335d83658df2: Pull complete
4f91496273fc: Pull complete
Digest: sha256:95358cb2eb7f73fab027d1ec7319c75e2ff1e60830437c01dce772e1e8f2978c
Status: Downloaded newer image for amazon/dynamodb-local:latest
docker.io/amazon/dynamodb-local:latest
```

2. Start DynamoDB Local in a Docker container. `docker run -p 8000:8000 amazon/dynamodb-local`
```
$docker run -p 8000:8000 amazon/dynamodb-local
Initializing DynamoDB Local with the following configuration:
Port:   8000
InMemory:       true
DbPath: null
SharedDb:       false
shouldDelayTransientStatuses:   false
CorsParams:     *
```

3. Create the DynamoDB table. 
Lambda will attempt to create DynamoDB if `ResourceNotFoundException` is raised.
Run table creation script. `node .\src\createTable.js`

OR

Via CLI
`aws dynamodb create-table --table-name uid_concurrency_count --attribute-definitions AttributeName=uid,AttributeType=S --key-schema AttributeName=uid,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000` 

4. Retrieve the list of DynamoDB tables. `aws dynamodb list-tables --endpoint-url http://localhost:8000`
```
{
    "TableNames": [
        "uid_concurrency_count"
    ]
}
```

5. Start the function locally with Serverless. `serverless offline`

6. Test the `canStream` function in your browser. `http://localhost:3000/dev/canStream/96712348-12458908`
```
{
    "result": "success",
    "uid": "96712348-12458908",
    "canStream": true,
    "streamCount": 1
}
```

7. Test the `endStream` function in your browser. `http://localhost:3000/dev/endStream/96712348-12458908`
```
{
    "result": "success",
    "uid": "96712348-12458908",
    "removedStream": true,
    "streamCount": 0
}
```

8. Retrieve Scan of Items. `aws dynamodb scan --table-name uid_concurrency_count --endpoint-url http://localhost:8000`
```
{
    "Items": [
        {
            "count": {
                "N": "0"
            },
            "uid": {
                "S": "96712348-12458908"
            }
        }
    ],
    "Count": 1,
    "ScannedCount": 1,
    "ConsumedCapacity": null
}
```

## What's left
1. X-Ray Monitoring ( console.error for cloudwatch logs ) : 15m-30m (https://github.com/aws-samples/aws-xray-sdk-node-sample/blob/master/index.js)
2. Lambda Environmental Variables via Serverless : 1h
3. Cloud Deployment : 30m-1h ( prepping + testing )