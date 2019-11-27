#!/bin/bash
NODEOS=/home/ubuntu/releases/ultraio/eosio/build/programs/nodeos
date
./stop.sh
timestamp=$(date +%s)
$NODEOS/nodeos --disable-replay-opts --data-dir ./ --config-dir ./ "$@" > stdout.txt 2> logs/eos-$timestamp.log &  echo $! > nodeos.pid
rm -f eos.log
ln -s logs/eos-$timestamp.log eos.log
