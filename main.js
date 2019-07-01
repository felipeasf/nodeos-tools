const config = require('.config');
const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');
const {spawn} = require('child_process');

function clean(){
    //clean state data folder
    const state_dir = config.data_path + "state/";
    fs_extra.removeSync(state_dir);

    //clean blocks data folder
    // const blocks_dir = config.data_path + "blocks/";
    // fs_extra.removeSync(blocks_dir);

}

let checkSizeId = null;

function check_size(){

}

function replay_snap(){

    console.log("snapshot");
    flag_snap = false;

    const snap_files = fs.readdirSync(config.snap_dir);
    const snap = config.snap_dir + snap_files[snap_files.length - 1]
    const args_snap = ['--snapshot', snap ,'--config-dir', config.config_path, '--data-dir', config.data_path];

    child_proc = spawn("nodeos", args_snap, {detached: true});

    console.log("spawned: " + child_proc.pid);

    child_proc.on('error', (err) => {
        console.log('Failed to start subprocess.');
        console.log(err);
    });
    child_proc.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    //print nodeos output
    // child_proc.stderr.on('data', (data) => {
    //     console.log(data.toString());
    // });

    child_proc.on('close', (code) => {
        if(count == 3){
            currentState = states.crashed;
            count = 0;
        }else{
            currentState = states.stopped;
        }
        child_proc = null;
        console.log(`child process exited with code ${code}`);
        check();
     });

    currentState = states.running;
    //check();
    // checkTimer = setInterval(() => {
    //     check();
    // }, config.check_time);
}
