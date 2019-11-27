const config = require('./config');
const {spawn, exec} = require('child_process');
const http = require('http');
//file system
const fs = require('fs');
const fs_extra = require('fs-extra');
const path = require('path');

//machine states
const states = {"starting": 0, "running": 1, "stopped": 2, "crashed": 3, "cleaning": 4, "freezed": 5};

let checkTimer;
let currentState = states.stopped;
let count = 0;
let idleFor = 0;
let flag_snap = false;
let lastHeadBlock = 0;
let currentHeadBlock = 0;
let checkIdleId = null;

process.on("SIGINT", () => {
    exit()
});

//NOTE: I have to run this script as the root (sudo) to avoid getting permission
//denied errors. If I do not run the script as the super user, the script is 
//denied the permission to access the data and config folders. - Aitzaz [July 26th, 19]

//call check function(FSM) and set a time interval to do the check
check();
checkTimer = setInterval(() => {
    check();
}, config.check_time);


function checkIdleChain(){
    console.log("checkIdleChain");

    if (lastHeadBlock && currentHeadBlock === lastHeadBlock) {
        idleFor += 1;
        console.log("idleFor: " + idleFor);
        // Restart if a new block is not produced in 60 seconds.
        if (idleFor > 60) {
            currentState = states.stopped;
        }
    } else {
        idleFor = 0;
        lastHeadBlock = currentHeadBlock;
    }
}

//function to check if nodeos is producing blocks or freezed
function startIdleCheck() {
    if (!checkIdleId) {
        checkIdleId = setInterval(() => {
            const request = http.get(config.api_url, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                    //console.log(JSON.parse(data));
                });
                resp.on('end', () => {
                    currentInfo = JSON.parse(data);
                    currentHeadBlock = parseInt(currentInfo['head_block_num']);
                    //console.log("HeadBlock: " + currentHeadBlock);
                    checkIdleChain();
                });
            }).on("error", (err) => {
                console.log("IdleCheck Error: " + err.message);
            });
            request.setTimeout(60000, (timeout) => {
                currentState = states.freezed;
            });
        }, 1000);
    }
}

function clean_state(){
    //clean state data folder
    const state_dir = config.data_path + "state/";
    fs_extra.removeSync(state_dir);

}

function clean_blocks(){
    //clean blocks data folder
    const blocks_dir = config.data_path + "blocks/";
    fs_extra.removeSync(blocks_dir);
}

//TODO: I think we should have some sort of a mechanism where the logs from nodeos get written to a log file which can be 
//examined in case of a problem where troubleshooting is required. Write now all the meaningful information from the nodeos
//logs is only printed on the debug console and doesn't make it to the terminal at all. - Aitzaz [July 26th '19]
function start() {

    if(flag_snap){

        console.log("snapshot");
        flag_snap = false;

        const snap_files = fs.readdirSync(config.snap_dir);

        if(snap_files.length > 0){
		const snap = config.snap_dir + snap_files[snap_files.length - 1];
		const args_snap = ['--snapshot', snap ,'--config-dir', config.config_path, '--data-dir', config.data_path, '--disable-replay-opts'];
        }
        else {
            console.error('Failed to find any snapshot files in the directory:  ', config.snap_dir);
            exit();
        }

    } else {
        const args = ['--config-dir', config.config_path, '--data-dir', config.data_path, '--disable-replay-opts', '--filter-on="*"'];
        child_proc = spawn(config.binary_path + "nodeos", args, {detached: true});
    }

    console.log("spawned: " + child_proc.pid);

    //Observation: None of the console.log messages in the following callbacks get displayed on the terminal. Maybe we should use
    //console.err and console.warn instead? - Aitzaz [July 26th, 19]
    child_proc.on('error', (err) => {
        //Question: Shouldn't we log these traces to the console as errors (or at least as warnings)? - Aitzaz [July 26th, 19]
        console.log('Failed to start subprocess.');
        console.log(err);
    });

    child_proc.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    //print nodeos output
    child_proc.stderr.on('data', (data) => {
        //Question: Shouldn't we log these traces to the console as errors (or at least as warnings)? - Aitzaz [July 26th, 19]
        //console.log(data.toString());
        console.warn(data.toString());
    });

    child_proc.on('close', (code) => {
        if(count == 3){
            currentState = states.crashed;
            count = 0;
        }else{
            currentState = states.stopped;
        }
        child_proc = null;
        console.log(`child process exited with code ${code}`);
        //check();
     });

    currentState = states.running;
}

function exit() {
    clearInterval(checkTimer);
    clearInterval(checkIdleId);

    console.log("Exiting...");
    process.exit();
}

function check() {
    if (currentState === states.starting) {
        // TODO: wait until nodeos starts.
        // if nodeos has started, change to running
        // if not, exit (something is wrong with nodeos)
        // here we may have a problem to detect if nodeos is actually starting or if it crashed
        console.log("starting..");
        start();

    } else if (currentState === states.running) {
        //count = 0;
        console.log("running");
        //check if nodeos stoped producing blocks  if (lastHeadBlock && currentHeadBlock === lastHeadBlock)
        startIdleCheck();
    } else if (currentState === states.stopped) {
        console.log("stopped");
        if (config.auto_restart) {
            count++;
            currentState = states.starting;
        } else {
            exit();
        }
    } else if (currentState === states.crashed) {
        console.log("crashed");
        currentState = states.cleaning;

    } else if (currentState === states.cleaning) {
        // check if last snapshot can be used (it can't be a recent one, for example less than a few minutes ago as it can contain reversible blocks that were forked)
        console.log("cleaning...");
        flag_snap = true;
        clean_state();   
        //ToDo: remove data folder after try to restore removing only state dir?

        currentState = states.stopped;
    } else if (currentState === states.freezed) {
        console.log("freezed");
        //clearInterval(checkIdleId);
        child_proc.kill('SIGINT');
        //currentState = states.stopped;
    } else {
        // TODO: handle error
        exit();
    }
}

