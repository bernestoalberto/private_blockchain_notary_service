const SHA256 = require('crypto-js/sha256');
let BlockChain = require('./blockChain');
let empty = require('is-empty');
let cookieSession = require('cookie-session');
let helmet = require('helmet');
let compression = require('compression');
let expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
const TimeoutRequestsWindowTime = 5*60*1000;
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');
let winston = require('winston');
let mempool = new Map();
let timeoutRequests = new Map();
const levels = { 
    error: 0, 
    warn: 1, 
    info: 2, 
    verbose: 3, 
    debug: 4, 
    silly: 5 
  };
const logger = winston.createLogger({
    level: levels.info,
    format: winston.format.json(),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
   
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }
/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.app.use(helmet());
        this.app.use(compression());

       this.registerStar = true;
       this.validationWindow = 0;
       this.status = {};
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestValidation();
        this.validRequest();
        this.getBlockByHash();
        this.getBlockByWalletAddress();
        this.getStarByTokenId();
        this.blockchain = new BlockChain();
    }
    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", (req, res) => {
            // Add your code here
            if (!req.params.index) return res.sendStatus(400);
            console.log('Requested /block/:index');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('cache-control', 'no-cache');
            // res.setHeader('Content-Length', '238');
            res.setHeader('Conection', 'close');
            res.cookie('eb', 'gb', { domain: '.eabonet.com', path: '/block/:index', secure: true });
            res.cookie('blockchain', '1', { maxAge: 900000, httpOnly: true });
               this.blockchain.getBlockHeight().then((height) => {
                if(parseInt(height) > parseInt(req.params.index)){
                 this.blockchain.getBlock(req.params.index)
                 .then((block)=>{
                     block = JSON.parse(block);
                     block.body.star.story = hex2ascii(block.body.star.story);
                     block = JSON.stringify(block);
                    res.end(block);
                 })
                 .catch((error)=>{
                    console.log(error);
                   res.send(error);
                    process.exit(1);
                });
                
               }
               else{
                  res.send(`Index block  ${req.params.index} out of bounds`);
                } 
               }).catch((error)=>{
                   console.log(error);
                  res.send(error);
                   process.exit(1);
               });
        });
    }
    verifyAddressRequest(address){
        return (mempool.get('address') == address) ? true : false ;
    }
    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
     postNewBlock() {
        this.app.post("/block", (req, res)=>{
            if (empty(req.body.address)) return res.sendStatus(400).end();
            console.log('Requested /block"');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('cache-control', 'no-cache');
            res.setHeader('Content-Length', '238');
            res.setHeader('Conection', 'close');
            res.cookie('eb', 'gb', { domain: '.eabonet.com', path: '/block/:index', secure: true });
            res.cookie('blockchain', '1', { maxAge: 900000, httpOnly: true });
            if(this.verifyAddressRequest(req.body.address)){
                let body = {
                    address: req.body.address,
                    star: {
                              ra: req.body.star.ra,
                              dec:req.body.star.dec,
                              mag: req.body.star.mag,
                              cen: req.body.star.cen,
                              story: Buffer.from(req.body.star.story).toString('hex')
                      }
               };
                this.blockchain.addBlock(body).then((block)=>{
                    block = JSON.parse(block);
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    block = JSON.stringify(block);
                    res.send(block);
                }).catch((error)=>{
                    console.log(error);
                     res.send('There was an issue with your request. Try again later');
                     logger.error(error.toString);
                     process.exit(1)
                })
            }
            else{
                res.send('Address not valid. Try again later!!!');
            }
                 
        });
    }
        removeValidationRequest(wallet){
        timeoutRequests.delete(wallet);
        mempool.delete(wallet);
    }
    validRequest(){
        this.app.post("/message-signature/validate", (req, res)=>{
            console.log('Requested /message-signature/validate');
            if (empty(req.body.address) &&  empty(req.body.signature)) return res.sendStatus(400).end();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('cache-control', 'no-cache');
            res.setHeader('Content-Length', '238');
            res.setHeader('Conection', 'close');
            res.cookie('eb', 'gb', { domain: '.eabonet.com', path: '/message-signature/validate', secure: true });
            res.cookie('blockchain', '1', { maxAge: 900000, httpOnly: true });
            this.validateRequestByWallet(req);
            let timeOut = this.getTimebyWallet(req.body.address);
            this.removeValidationRequest(req.body.address); 
             res.send(
                 {
                "registerStar": this.registerStar,
                "status": {
                    "address": req.body.address,
                    "requestTimeStamp": timeOut,
                    "message": `${req.body.address}:${timeOut}:starRegistry`,
                    "validationWindow": 200,
                    "messageSignature": true
                }
            });
        });             
        }
    getStarByTokenId(){
        this.app.get('/star/:starTokenId',(req,res)=>{
          /****
           * ["Star power 103!", "I love my wonderful star", "ra_032.155", "dec_121.874", "mag_245.978"]
           */
          if (!req.params.starTokenId) return res.sendStatus(400);
          console.log('Requested /star/:starTokenId');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('cache-control', 'no-cache');
          res.setHeader('Conection', 'close');
          res.cookie('eb', 'gb', { domain: '.eabonet.com', path: '/block/:starTokenId', secure: true });
          res.cookie('blockchain', '1', { maxAge: 900000, httpOnly: true });
             this.blockchain.getStarByToken(req.params.starTokenId).then((star) => {
                //    block = JSON.parse(star.body.star);
                star.body.star.storyDecoded = hex2ascii(star.body.star.story);
                 star = JSON.stringify(star.body.star);
                //    block = JSON.stringify(block);
                  res.end(star);
             }).catch((error)=>{
                 console.log(error);
                res.send(error);
                 process.exit(1);
             });
        });
    }
    requestObject (req){
        this.validationWindow = req.validationWindow;
        let time = this.getTimebyWallet(req.body.address);
      return  {
            "walletAddress": req.body.address,
            "requestTimeStamp": time,
            "message": `${req.body.address}:${time}:starRegistry`,
            "validationWindow": req.validationWindow
        };
    }
    validateRequestByWallet(req){
   let signature = req.body.signature;
   let address = req.body.address;
   let message =  `${address}:${this.getTimebyWallet(address)}:starRegistry`;
   let requestTimeStamp = this.getTimebyWallet(address);
   let isValid = bitcoinMessage.verify(message, address, signature);
   this.registerStar = true;
   this.status = {
   address: address,
   requestTimeStamp: requestTimeStamp,
   message: message,
   validationWindow: this.validationWindow,
   messageSignature: 'valid'
  };

    (isValid) ? mempool.set(address,this.status ):'';
     
    }
    setTimeOut(address){
       let timeElapse = parseFloat(new Date().getTime().toString().slice(0,-3)) - parseFloat(this.getTimebyWallet(address));
       let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
       this.validationWindow = timeLeft;
        setTimeout(function(){
            timeoutRequests.delete(address);
            console.log(`requestValidation deleted ${address}`);
            },
             TimeoutRequestsWindowTime 
             );

    }
    /**
     * Implement a POST Endpoint -Users start out by submitting a validation request , url: "/api/requestValidation"
     */
   
    requestValidation() {
        this.app.post("/requestValidation", (req, res)=>{
            if (empty(req.body.address)) return res.sendStatus(400).end();
            console.log("Requested /requestValidation");
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('cache-control', 'no-cache');
            res.setHeader('Content-Length', '238');
            res.setHeader('Conection', 'close');
            res.cookie('eb', 'gb', { domain: '.eabonet.com', path: '/requestValidation', secure: true });
            res.cookie('blockchain', '1', { maxAge: 900000, httpOnly: true });
           let result = this.addRequestValidation(req.body.address);
           if(result == 'added'){
            this.setTimeOut(req.body.address);
            res.send(this.requestObject(req));
           }
           else{
               let interval = parseFloat(new Date().getTime().toString().slice(0,-3)) - parseFloat(this.getTimebyWallet(req.body.address)) ;
            res.send(
                {
                    "address": req.body.address,
                    "requestTimeStamp": this.getTimebyWallet(req.body.address),
                    "message": `${req.body.address}:${this.getTimebyWallet(req.body.address)}:starRegistry`,
                    "validationWindow": 300 -  interval
                }
            );
           }
            
        });
    }
    getTimebyWallet(wallet){
        let time = 0;
        timeoutRequests.forEach((value, key, map)=>{
          if(key == wallet){
             time = value; 
          }
        });
        return time;
    }
    AddressExist(wallet){
        
        let exist = false;
        mempool.forEach((value, key, map)=> {
        if(value == wallet){
            exist = true;
           }
           
      });
      return exist;
    }
    addRequestValidation(wallet){
        let search = this.AddressExist(wallet);
        if(!search){
        mempool.set("address",wallet);
        timeoutRequests.set(wallet,new Date().getTime().toString().slice(0,-3));
        return 'added';
    }
    else{
        return wallet;
       
    }


    }
 /**
     * Implement a POST Endpoint -Get star block by wallet address , url: "localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
     */

    getBlockByHash(){
        // this.app.post("/stars/hash/:hash", (req, res)=>{
        this.app.get("/stars/hash/:hash", (req, res)=>{
            console.log('Requested /stars/hash/');
            if (empty(req.params.hash)) return res.sendStatus(400).end();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('cache-control', 'no-cache');
            res.setHeader('Content-Length', '238');
            res.setHeader('Conection', 'close');
            res.cookie('eb', 'gb', { domain: '.eabonet.com', path: '/stars/hash/:hash', secure: true });
            res.cookie('blockchain', '1', { maxAge: 900000, httpOnly: true });
            this.blockchain.getBlockByHash(req.params.hash).then((block)=>{
               (block) ?res.send(block): res.send(`Block not found with hash ${req.params.hash} criteria`);
            }).catch((error)=>{
                console.log(error);
                 res.send('There was an issue with your request. Please try again later');
                 logger.error(error.toString);
                //  process.exit(1)
            })
            
        });
    }
    getBlockByWalletAddress(){
        this.app.get("/stars/address/:address", (req, res)=>{
            console.log('Requested /stars/address/:address');
            if (empty(req.params.address)) return res.sendStatus(400).end();
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('cache-control', 'no-cache');
            res.setHeader('Content-Length', '238');
            res.setHeader('Conection', 'close');
            res.cookie('eb', 'gb', { domain: '.eabonet.com', path: '/stars/address/:address', secure: true });
            res.cookie('blockchain', '1', { maxAge: 900000, httpOnly: true });
            this.blockchain.getBlockByWalletAddress(req.params.address).then((block)=>{
                (block) ?res.send(block): res.send(`Block not found with wallet address ${req.params.address} criteria`);
            }).catch((error)=>{
                console.log(error);
                 res.send('There was an issue with your request. Please try again later');
                 logger.error(error.toString);
                //  process.exit(1)
            })
            
        });
    }
    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    initializeMockData() {
        if(this.blocks.length === 0){
            for (let index = 0; index < 10; index++) {
                let blockAux = new Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                this.blocks.push(blockAux);
            }
        }
    }
}
/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}