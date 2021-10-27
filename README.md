# Viewer Stream Concurrency Limiter

This function is written to limit the amount of streams a given user currently has open.
The API consumer will pass in a Unique ID ( this can be userName, accountName, accountID ) and it will track and increment/decrement the UID if a stream opens/closes.

## Service lifecycle
Before the external provider serves the stream this service is called to verify if the user has more than 3 streams open.
If the current stream count is < 3, the consumer will be allowed to proceed with the next stream.
<insert success snip>

If the current stream count is >=3, don't allow the user to proceed.
<insert fail snip>

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

3. Create the DynamoDB table. `aws dynamodb create-table --table-name uid_concurrency_count --attribute-definitions AttributeName=orderId,AttributeType=S --key-schema AttributeName=orderId,KeyType=HASH --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000`


4. Retrieve the list of DynamoDB tables. `aws dynamodb list-tables --endpoint-url http://localhost:8000`
```
{
    "TableNames": [
        "uid_concurrency_count"
    ]
}
```
