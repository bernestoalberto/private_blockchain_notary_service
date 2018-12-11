# Private Blockchain Notary Service
A Star Registry Service that allows users to claim ownership of their favorite star in the night sky.
## About Private Blockchain Notary Service

The project's structure is display it on the image down below
![Project Structure](https://github.com/bernestoalberto/private/tree/master/structure.png)

The application features are : <br>
The Blockchain dataset that allow you to store a Star <br>
 Persist the data using LevelDB. <br>
The application  allow users to identify the Star data with the owner. <br>
•Create a Mempool component,
• Store a  temporal validation requests for 5 minutes (300 seconds) and  temporal valid requests for 30 minutes (1800 seconds).
•To Manage the validation time window.
The REST API  allows users to interact with the application:
• allowing users to submit a validation request. <br>
• allow users to validate the request. <br>
• be able to encode and decode the star data. <br>
• allow be able to submit the Star data. <br>
• allow lookup of Stars by hash, wallet address, and height.<br>

 These are the main functionalities 

<a src='http://localhost:8000/block/1'>GET block</a>
Error Handling: 
The function throw an error when the height entered in the URL is out of bounds. Prints : <br>
Request :
http://localhost:8000/50 <br>

BlockChain Height : 20 blocks <br>

Response: <br>
``
`Index block 50 out of bounds `
``

<a src='http://localhost:8000/block'>POST block</a>

Request: <br>
``
http://localhost:8000/block
``
``
body : {}
``
<br>
Response:
``
There was an issue with your request. Try again later
``
<a src='http://localhost:8000/requestValidation '>Request Validation</a>
Request:
Response:
<a src='http://localhost:8000/message-signature/validate'>Message Signature validation</a>
Request :
address: 1FrStBTuPedKgjdo3zKF3ryDqutkD1k6h5
signature : IIODs02KEe6K5eec4EbyIyxvLn1fDXbST1S1KGeplDl8bXWRqoU30FN0Rz8hqLYOTDvfj9sY8tCQDvRdX7cihow=

<a src='http://localhost:8000/stars/hash/5325ef5d6b37c7f6b3dbfe31ffc60a1458721ff508abb8500a37c56d6970ef1c'>Get block by hash</a>
Get star block by hash with JSON response
Response:
``
{
    "hash": "5325ef5d6b37c7f6b3dbfe31ffc60a1458721ff508abb8500a37c56d6970ef1c",
    "height": 2,
    "body": {
        "address": "1FrStBTuPedKgjdo3zKF3ryDqutkD1k6h5",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1544471571",
    "previousblockHash": "ea5b2400ca4d028ffdacea0b81a095b721b002b18a5067e098c885c87fa0617d"
}
``

<a src='http://localhost:8000//stars/address/1FrStBTuPedKgjdo3zKF3ryDqutkD1k6h5'>Get block by Wallet address</a>
Get star block by wallet address
Request:
Response:

## Aditional Functionalities
There are additional functions to suppport the API purpose  like: <br>
Counts all the Blocks in your chain and give you as a result the last height in your chain <br>
``
 getBlockHeight() 
 ``
 <br>
  Gets a block and returns it as JSON string object
 <br>
 ``
 getBlock() 
 ``
 <br>
The last block index<br>
 ``
 getLatestBlock() 
 ``
 <br>
 Validates block data integrity <br>
 ``
 validateBlock()  
 ``
 <br>
 Validates all blocks data integrity <br>
 ``
 validateAllBlocks() 
 ``
 <br>
  Validates blockChain data integrity <br>
 ``validateChain() 
``<br>
requestObject
retuns
``
{
    "walletAddress": "wallet_address",
    "requestTimeStamp": "requestedTimetamp",
    "message": "wallet_adress:requestedTimeStamp:starRegistry",
    "validationWindow": 300
}
``
## Node.js framework
[Express.js](https://expressjs.com/).
## Endpoint documentation
GET Block Endpoint <br>
Request
URL: http://localhost:8000/block/6 <br>
``
body : {
"address": "1FrStBTuPedKgjdo3zKF3ryDqutkD1k6h5",
    "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
}
``<br>
Response <br>
``
{
    "hash": "295196619691fc068f1eed4cc00fd7adb0194c10876a2523d906232fd18c3afc",
    "height": 9,
    "body": {
        "address": "1FrStBTuPedKgjdo3zKF3ryDqutkD1k6h5",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1544478346",
    "previousblockHash": "b96ec4fa0cbd85add76ae70d451b9c45fb68a1f2582a7a9a2bf7bd9318c2c3ad"
}
``
<br>
POST Block Endpoint <br>
Request 
URL: http://localhost:8000/block <br>
``
{

"body": "Testing RestApi "
}
``

Response<br>
``
{
    "hash": "b5d2edb90295bee2ecfc9a2ef0abc4fd753b5ff23cb42faf55136f50c8a2f6ba",<br>
    "height": 19,<br>
    "body": "Testing RestApi ",<br>
    "time": "1544354881",<br>
    "previousblockHash": "1337ff0db122b01330663204d317c8099801d2500713f24f8bb2a60339a8f61a"
}``<br>

Errors <br>
Service responds with appropriate error responses when posting or getting contents.

URL: http://localhost:8000/block <br>
``
{

"body": " "
}
``
<br>
Response <br>

Bad Request

### Dependencies
level <br> 
crypto-js <br>
nodemon <br>
cookie-session <br>
npm <br>
winston <br>
helmet <br>
empty <br>
body-parser <br>
express  <br>

## Installation
Run
``
npm install
``
## Execution
Run
``nodemoon
``
