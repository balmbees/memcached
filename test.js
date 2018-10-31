const Memcached = require("./lib").Memcached;
const MemcachedPlus = require("memcache-plus");

async function main() {
  const url = "vingle-edge-stage.zwsblh.cfg.use1.cache.amazonaws.com";

  const client1 = new Memcached(
    [url],
    {
      debug: true,
      elasticacheAutoDiscovery: true,
    }
  );

  const client2 = new MemcachedPlus({
    hosts: [url],
    autodiscover: true,
    netTimeout: 500,
    reconnect: true,
  });


  const hashRingTest = await (async () => {
    for (let i=0; i<100; i++) {
      // Set Same Key
      const value = Date.now();
      const key = "RANDOM_KEY" + Math.random().toString().slice(0, 3) + i;
      const key1 = "1--" + key;
      const key2 = "2--" + key;
      await client1.set(key1, i);
      await client2.set(key2, i);

      // Get data, but do cross get
      const r1 = await client1.get(key2);
      const r2 = await client2.get(key1);
      console.log("R1 R2", { r1, r2 });
      if (r1 !== r2) {
        throw "ERROR";
      }
    }
  })();

  // Connection Failover test needed
  const hashRingTest = await (async () => {
    for (let i = 0; i < 100; i++) {
      // Set Same Key
      const value = Date.now();
      const key = "RANDOM_KEY" + Math.random().toString().slice(0, 3) + i;
      const key1 = "1--" + key;
      const key2 = "2--" + key;
      await client1.set(key1, i);
      await client2.set(key2, i);

      // Get data, but do cross get
      const r1 = await client1.get(key2);
      const r2 = await client2.get(key1);
      console.log("R1 R2", { r1, r2 });
      if (r1 !== r2) {
        throw "ERROR";
      }
    }
  })();
}

main().then(console.log, console.log);


