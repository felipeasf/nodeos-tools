# Snapshot Creator

NodeJS script that takes snapshots.

## Setup

Dependencies:
- Node.js
- eosio::producer_api_plugin

RUN:
- Clone this repository
- npm install
- node main.js

## Configuration - *config.js* file

- `api_url` -> Default value: http://127.0.0.1:8888/v1/producer/create_snapshot
- `snapshot_dir` -> snapshot folder path. Usually, inside nodeos data folder. (always end the snapshot_dir with /)
 To change the default snapshot folder, add the `snapshots-dir` option on the nodeos config.ini file, with the new path.
- `total_snapshots` -> total snapshot files to keep
- `schedule_rule` -> '0 * * * * *' // cron-style equivalent to every hour

### Cron-style Scheduling

The cron format consists of:
```
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```

Examples with the cron format:

```js
var schedule = require('node-schedule');

var j = schedule.scheduleJob('42 * * * *', function(){
  console.log('The answer to life, the universe, and everything!');
});
```

Execute a cron job when the minute is 42 (e.g. 19:42, 20:42, etc.).

And:

```js
var j = schedule.scheduleJob('0 17 ? * 0,4-6', function(){
  console.log('Today is recognized by Rebecca Black!');
});
```

Execute a cron job every 5 Minutes = */5 * * * *

You can also get when it is scheduled to run for every invocation of the job:
```js
var j = schedule.scheduleJob('0 1 * * *', function(fireDate){
  console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
});
```
This is useful when you need to check if there is a delay of the job invocation when the system is busy, or save a record of all invocations of a job for audit purpose.
