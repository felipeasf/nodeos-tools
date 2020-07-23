const config = require('./config');
const StateMachine = require('javascript-state-machine');
const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;


let fsm = new StateMachine({
    init: 'check',
    transitions: [
        { name: 'stopping1', from: 'check', to: 'stopped1' },
        { name: 'wipe1', from: 'stopped1', to: 'cleaned1' },
        { name: 'replaying1', from: 'cleaned1', to: 'ok1'    },
        { name: 'stopping2', from: 'ok1', to: 'stopped2' },
        { name: 'wipe2', from: 'stopped2', to: 'cleaned2' },
        { name: 'replaying2', from: 'cleaned2', to: 'ok2'    },
        { name: 'checking', from: 'ok2', to: 'check'    },
    ],
    methods: {
        onStopping_1:     function() { console.log('stopping 1')    },
        onWipe_1:   function() { console.log('wiping 1')     },
        onReplaying_1: function() { console.log('replaying 1') },
        onStopping_2: function() { console.log('stopping 2') },
        onWipe_2:   function() { console.log('wiping 2')     },
        onReplaying_2: function() { console.log('replaying 2') },
        onChecking: function() { console.log('checking') },
    }
});

function check_disk(){
    console.log("checking disk");
    exec('df -h "' + config.disk + '"', function(err, stdout) {
        if (err) {
            return console.log(err);
        }

        try {
            console.log(parse(stdout));
            //console.log(stdout);
        } catch (e) {
            console.log(e);
        }
    });
}

function parse(dusage) {
    var lines = dusage.split('\n');
    if (!lines[1]) {
        throw new Error('Unexpected df output: [' + dusage + ']');
    }
    var parts = lines[1]
        .split(' ')
        .filter(function(x) { return x !== ''; });
    var total = parts[1];
    var used = parts[2];
    var available = parts[3];

    return {
        total: total*1024,
        used: used*1024,
        available: available*1024
    };
}

function wipe_data(path){

    exec('rm -rf ' + path + '/state ' + path + '/blocks ' + path + '/protocol_features');

    exec('rm ' + path + '/logs/* ');

    // //clean state data folder
    // const state_dir = path + "/state/";
    // fs_extra.removeSync(state_dir);
    //
    // //clean blocks folder
    // const blocks_dir = path + "/blocks/";
    // fs_extra.removeSync(blocks_dir);
    //
    // //clean logs folder
    // const logs_dir = path + "/logs/";
    // fs_extra.removeSync(logs_dir);
    //
    // //clean protocol_features folder
    // const protocol_features = path + "/protocol_features/";
    // fs_extra.removeSync(protocol_features);

}

function stop_nodeos(path){
    //usar scripts start...stop
    exec(path + '/stop.sh ', function(err, stdout) {
        if (err) {
            return console.log(err);
        }

        try {
            console.log(stdout);
        } catch (e) {
            console.log(e);
        }
    });
    console.log("stop nodeos");
}

function pause_producer(endpoint) {
    exec('curl' +  endpoint + '/v1/producer/pause');

}

function resume_producer(endpoint) {
    exec('curl' +  endpoint + '/v1/producer/resume');
}

function replay_snap(n_path, s_path){
    //GET LAST SNAP
    let last_snap = "snapshot-03ffb094e5eba385d8324c5f1ed1c51b1d51205071779e404e60dcd8a4ecff89.bin";
    exec(n_path + '/start.sh --snapshot ' + s_path + "/" + last_snap);
    console.log("snapshot");
}

process.on ('SIGINT',() => {
    console.log('You clicked Ctrl+C!');
    process.exit(1);
});

setInterval(() => {
    console.log('Running Code');
    check_disk();
}, 3000)