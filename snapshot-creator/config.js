module.exports = {
    api_url: 'http://127.0.0.1:8888/v1/producer/create_snapshot',
    total_snapshots: 10,
    //always finish the snapshot_dir with /
    //macos path
    snapshot_dir: '/Users/{USERNAME}/Library/Application Support/eosio/nodeos/data/snapshots/',
    //linux path
    //snapshot_dir: '/home/{USERNAME}/.local/share/eosio/nodeos/data',
    schedule_rule: '0 * * * *' // cron-style equivalent to every hour
};
