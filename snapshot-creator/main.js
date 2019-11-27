// Node Schedule
const schedule = require('node-schedule');

// Request
const request = require('request');

//config file
const config = require('./config');

//file system
const fs = require('fs');

process.on("SIGINT", () => {
    job.cancel(false);

    console.log("Exiting...");
    process.exit();
});

const options = {
    method: 'POST',
    url: config.api_url,
    headers: {'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'}
};

const job = schedule.scheduleJob(config.schedule_rule, (fireDate) => {
    console.log('Date:', fireDate);

    create_snapshot().then((result) => {
        console.log('snapshot created. head block id:', result);
    }).catch((error) => {
        console.log('failed to create snapshot', error);
    });

    delete_older();
});

function create_snapshot() {
    console.log('requesting snapshot creation...');

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                const data = JSON.parse(body);
                resolve(data.head_block_id);
            }
        });
    });
}

function delete_older() {

    let files = fs.readdirSync(config.snapshot_dir);
    // console.log(files.length);

    if(files.length < config.total_snapshots ){
        return;
    }

    try {
        fs.unlinkSync(config.snapshot_dir + files[0]);
    } catch(err) {
        console.log('failed to remove oldest snapshot', err)
    }
}
