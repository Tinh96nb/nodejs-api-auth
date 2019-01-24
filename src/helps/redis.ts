import * as redis from 'redis';


const EXPIRE = 60*60*24*parseInt(process.env.JWT_EXPIRES_IN);

const configRedis: object = {
  host: process.env.REDIST_HOST || '127.0.0.1',
  port:process.env.REDIS_PORT || 6379,
}
const client = redis.createClient(configRedis);

client.on("error", function (err: any) {
    console.log("Connect redis errors");
});

export async function setKey(field: string, hash: string, suffix: string) {
  const key= `${field}-${suffix}`;
  return new Promise((resolve, reject) => {
    client.exists(key, function(err, reply) {
      if(err) reject(err)
      client.set(key, hash);
      client.expire(key, EXPIRE);
      resolve(1);
    });
  })
};

export async function getKey(key: string) {
  return new Promise((resolve, reject) => {
    client.get(key, function (err, data) {
      if (err) reject(err)
      resolve(data);
    })
  });
};


export async function deleteKey(field: string, browser: string) {
  const key = browser === 'all' ? `${field}-*` : `${field}-${browser}-*`;
  const listData: any = await getMultiKey(key);
  return new Promise((resolve, reject) => {
    client.del(listData, function (err, data) {
      if (err) reject(err)
        resolve(data);
      })
    });
};

function getMultiKey (pattern: string) {
  return new Promise((resolve, reject) => {
    client.keys(pattern, function (err, keys) {
      resolve(keys)
    });
  });
}