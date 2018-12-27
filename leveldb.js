/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

let level = require('level');
let chainDB = './chaindata';
let db = level(chainDB);
const hex2ascii = require('hex2ascii');
let  persistent= {
// Add data to levelDB with key/value pair
 addLevelDBData:(key,value)=>{
  return new Promise((resolve,reject)=>{
    db.put(key, value, (err)=> {
      
      if (err) {
        console.log( `Block ${key}  submission failed`, err);
      reject(err);
      }
      resolve(value);
    })
  });

},
deleteBlock:(key)=>{
  return new Promise((resolve,reject)=>{
    db.del(key, (err)=> {
      if (err) {
        console.log( `Block ${key} `, err);
      reject(err);
      }
      console.log( `Block ${key}  has deleted`);
      resolve(true);
    })
  });

},
getAllBlocks: ()=>{
  let dataArray  = [];
return new Promise((resolve,reject)=>{
  db.createReadStream()
  .on('data', function (data) {
      dataArray.push(data);
  })
  .on('error', function (err) {
      reject(err)
  })
  .on('close', function () {
      resolve(dataArray);
  });
});
},
countBlocks: ()=>{
  let counter  = 0;
return new Promise((resolve,reject)=>{
  db.createReadStream()
  .on('data', function (data) {
      counter++;
  })
  .on('error', function (err) {
      reject(err)
  })
  .on('close', function () {
      (counter > 0) ? resolve(counter) :resolve(0);
  });
});
},
// Get data from levelDB with key
 getLevelDBData: (key)=>{
   return new Promise((resolve, reject)=>{
    db.get(key, (err, value)=> {
      if (err) {
        console.log('Not found!', err);
      reject(err);
      }
      resolve(value);
    })
   })
},
// Get block by hash
getBlockByHash(hash) {
  // let self = this;
  let block = null;
  return new Promise(function(resolve, reject){
      db.createReadStream()
      .on('data', function (data) {
           data = JSON.parse(data.value);
          if(data.hash === hash){
            data.body.star.storyDecoded = hex2ascii(data.body.star.story);
              block = data;
          }
      })
      .on('error', function (err) {
          reject(err)
      })
      .on('close', function () {
          resolve(block);
      });
  });
},
getStarByToken(token) {
  // let self = this;
  let block = null;
  return new Promise(function(resolve, reject){
      db.createReadStream()
      .on('data', function (data) {
           data = JSON.parse(data.value);
           if(data.height > 0){
          if(data.body.star.story === token){
              block = data;
          }
          }
      })
      .on('error', function (err) {
          reject(err)
      })
      .on('close', function () {
          resolve(block);
      });
  });
},
// Get block by address
getBlockByWalletAddress(address) {
  // let self = this;
  let block = null;
  return new Promise(function(resolve, reject){
      db.createReadStream()
      .on('data', function (data) {
        data = JSON.parse(data.value);
          if(data.body.address === address){
            data.body.star.storyDecoded = hex2ascii(data.body.star.story);
              block = data;
          }
      })
      .on('error', function (err) {
          reject(err)
      })
      .on('close', function () {
          resolve(block);
      });
  });
},
// Add data to levelDB with value
 addDataToLevelDB :(block)=> {
    let i = 0;
  return new Promise((resolve,reject)=>{
    db.createReadStream().
    on('data', function(data) {
      i++;
    })
    .on('error', (err)=> {
      console.log('Unable to read data stream!', err);  
      reject(err);
    })
    .on('close', ()=> {
      // console.log(`Block #  ${i}`);
      persistent.addLevelDBData(block.height, JSON.stringify(block)).then((value)=>{
       resolve(value);
      }).catch((err)=>{
        reject(error);
      });
    });

  });
}
};
module.exports = persistent;