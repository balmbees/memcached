const Memcached = require("./lib").Memcached;
const MemcachedPlus = require("memcache-plus");

async function main() {
  const url = "vingle-edge-stage.zwsblh.cfg.use1.cache.amazonaws.com";

  const client1 = await Memcached.createForElasticache(url);
  const client2 = new MemcachedPlus({
    hosts: [url],
    autodiscover: true,
    netTimeout: 500,
    reconnect: true,
  });

  // // HashRing. 두 Client가 같은 key를 같은 서버에 넣는가
  // const hashRingTest = await (async () => {
  //   for (let i=0; i<5; i++) {
  //     // Set Same Key
  //     const value = Date.now();
  //     const key = "RANDOM_KEY" + Math.random().toString().slice(0, 3) + i;
  //     const key1 = "1--" + key;
  //     const key2 = "2--" + key;
  //     await client1.set(key1, i);
  //     await client2.set(key2, i);

  //     // Get data, but do cross get
  //     const r1 = await client1.get(key2);
  //     const r2 = await client2.get(key1);
  //     console.log("R1 R2", { r1, r2 });
  //     if (r1 !== r2) {
  //       throw "ERROR";
  //     }
  //   }
  // })();

  // // Connection Failover test needed
  // // 커넥션이 끊겼을때, 알아서 retry 하는가.
  // const hashRingTest = await (async () => {
  //   for (let i = 0; i < 100; i++) {
  //     // Set Same Key
  //     const value = Date.now();
  //     const key = "RANDOM_KEY" + Math.random().toString().slice(0, 3) + i;
  //     const key1 = "1--" + key;
  //     const key2 = "2--" + key;
  //     await client1.set(key1, i);
  //     await client2.set(key2, i);

  //     // Get data, but do cross get
  //     const r1 = await client1.get(key2);
  //     const r2 = await client2.get(key1);
  //     console.log("R1 R2", { r1, r2 });
  //     if (r1 !== r2) {
  //       throw "ERROR";
  //     }
  //   }
  // })();

  //
  // 0, undefined, null 에 대한 동작이 같은가.
  //

  const negativeValueHandlingTest = await (async () => {
    // 0
    {
      await client1.set("0-key", "====");
      await client2.set("1-key", "====");

      // Override
      await client1.set("0-key", 0);
      await client2.set("1-key", 0);

      const r1 = await client1.get("0-key");
      const r2 = await client2.get("1-key");
      console.log(JSON.stringify({ r1, r2 }));
      if ( !(r1 === 0 && r2 === 0) ) {
        throw "negativeValueHandlingTest ERROR";
      }
    }

    // Null
    {
      await client1.set("0-null-key", "====");
      await client2.set("1-null-key", "====");

      // Override
      await client1.set("0-null-key", null);
      await client2.set("1-null-key", null);

      const r1 = await client1.get("0-null-key");
      const r2 = await client2.get("1-null-key");
      console.log(JSON.stringify({ r1, r2 }));
      if ( !(r1 === null && r2 === null) ) {
        throw "negativeValueHandlingTest ERROR";
      }
    }

    // Undefined
    {
      await client1.set("0-undefined-key", "====");
      await client2.set("1-undefined-key", "====");

      // Override
      let es = [];
      try {
        await client1.set("0-undefined-key", undefined);
      } catch (e) {
        es.push(e);
      }
      try {
        await client2.set("1-undefined-key", undefined);
      } catch (e) {
        es.push(e);
      }

      if (es.length !== 2) {
        console.log(es);
        throw "undefined ERROR"
      }
    }

    // Not setted value.
    {
      await client1.del("0-empty-key");
      await client2.delete("1-empty-key");

      // Override
      const r1 = await client1.get("0-empty-key");
      const r2 = await client2.get("1-empty-key");

      console.log(JSON.stringify({ r1, r2 }));
      if ( !(r1 === undefined && r2 === undefined) ) {
        throw "Empty Value ERROR";
      }
    }
  })();

  /**
   *
   * Number, String이 아니라 Object를 넣었을때 Serialize / Deserialize 확인
   *
   */

  /**
   *
   * MultiSet / MultiGet
   *
   *
   *
   */
}

main().then(console.log, console.log);


