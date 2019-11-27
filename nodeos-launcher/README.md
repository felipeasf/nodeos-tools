# Nodeos Launcher

NodeJS script that watch nodeos process and recover it in case of fail. 

## Setup

Dependencies:
- Node.js

RUN:
- Clone this repository
- npm install
- node main.js

## Configuration - *config.js* file

- `api_url` -> Default value: http://127.0.0.1:8888/v1/chain/get_info
All paths below need to end with /
- `binary_path` -> nodeos binary folder path
- `data_path` -> nodeos data folder path
- `config_path` -> nodeos config folder path
- `snap_path` -> snapshot folder path
- `check_time` -> Time in milliseconds to check if is everything ok with nodeos. Default value is 5000 (5 seconds)
- `getInfo_timeout` -> Timeout limit to wait nodeos to answer for a request. If this timeout is reached, nodeos is considered as freezed. Default value is 60000 (1 min)
- `auto_restart` -> Set this param to true if you want to restart nodeos automatically.Otherwise, set to false. Default value is true.
