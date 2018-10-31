const Memcached = require("./lib").Memcached;

const expect = require("chai").expect;

process.on('uncaughtException', (err) => {
  console.log("uncaughtException", err);
});

process.on('exit', (err) => {
  throw new Error("Process Exit");
  // console.log("exit", err);
});

async function main() {
  const client = new Memcached([
    "127.0.0.1:11211",
    // "127.0.0.1:11212",
  ], {
    debug: true
  });

  // it should set multi / delete multi / get multi;
  const keys = [1,2,3,4,5,6,7,8,9,10];

  await Promise.all(keys.map(async (key) => {
    await client.set(`${key}`, key);
  }));
  expect(await client.getMulti(keys.map(i => i.toString()))).to.be.deep.eq({
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10
  });
  console.log("Success 1")

  await Promise.all([1,2,3,4].map(async (key) => {
    await client.del(`${key}`);
  }));
  // for (const key of [1, 2, 3, 4]) {
  //   await client.del(`${key}`);
  // }

  console.log(await client.getMulti(keys));
  expect(await client.getMulti(keys)).to.be.deep.eq({
    '3': 3,
    '6': 6,
    '7': 7,
    '9': 9,
    '10': 10
  });

  console.log("Success 2");
}

main().then(console.log, (error) => {
  console.log("ERROR : ", error);
});


