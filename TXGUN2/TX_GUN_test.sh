#!/bin/bash
################################################################################
#
# TX GUN
# Scrip Created by http://CryptoLions.io
# For EOS Junlge testnet
#
# https://github.com/CryptoLions/
#
################################################################################
CLEOSBIN=$( jq -r '.CLEOSBIN' "CONFIG.json" )

TXS_PER_PUSH=1
THREADS=1
REPEAT=1
ENDPOINT="$( jq -r '.ENDPOINT' CONFIG.json )"
ENDPOINT2="$( jq -r '.ENDPOINT2' CONFIG.json )"
CLEOS="$CLEOSBIN/cleos -u $ENDPOINT"
CLEOS2="$CLEOSBIN/cleos -u $ENDPOINT2"


echo "Preparing TXs [Loading gun]..."
./prepareTX.sh $TXS_PER_PUSH TEST &

echo ""
echo "Sending..."

$CLEOS2 push transactions tx_stress_test_TEST.json
