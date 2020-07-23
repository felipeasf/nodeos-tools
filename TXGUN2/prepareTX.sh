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

PRIV_KEY="$( jq -r '.PRIV_KEY_TO_SIGN_TX' "CONFIG.json" )"
ENDPOINT="$( jq -r '.ENDPOINT' CONFIG.json )"
DO_TRANSFER=$( jq -r '.DO_TRANSFER' "CONFIG.json" )
TRANSFER_FROM="$( jq -r '.TRANSFER_FROM' "CONFIG.json" )"
TRANSFER_TO="$( jq -r '.TRANSFER_TO' "CONFIG.json" )"
TRANSFER_AMOUNT="$( jq -r '.TRANSFER_AMOUNT' "CONFIG.json" )"
TRANSFER_MSG="$( jq -r '.TRANSFER_MSG' "CONFIG.json" )"
CLEOSBIN=$( jq -r '.CLEOSBIN' "CONFIG.json" )

CLEOS="$CLEOSBIN/cleos -u $ENDPOINT"


if [ "$1" = "" ] || [ "$2" = "" ]; then
    echo "$0 <count> <label>"
    exit;
fi

CHAIN_ID=$($CLEOS get info | jq -r ".chain_id")

expire_date="$(date -d "+55 min" +%Y-%m-%dT%H:%M:%S)"
COUNTER=1
MAX_TX=$1

SEED=$RANDOM
while [  $COUNTER -le $MAX_TX ]; do
    let COUNTER=COUNTER+1 

    if [ $DO_TRANSFER -eq 1 ]; then
	MSG=$(echo "{\"msg\":\"$TRANSFER_MSG $SEED $COUNTER\"}")
	tx1=$($CLEOS transfer $TRANSFER_FROM $TRANSFER_TO "$TRANSFER_AMOUNT" "$MSG" -s -j -d)
    else 
	MSG=$(echo "{\"text\":\"$TRANSFER_MSG $SEED $COUNTER\"}")
	tx1=$($CLEOS push action testertester stress "$MSG" -p $TRANSFER_FROM -s -j -d)
    fi

    tx1a=$(echo $tx1 | jq -c '.expiration=$expire' --arg expire "$expire_date" | jq . )

    tx1s=$($CLEOS sign "$tx1a" -c $CHAIN_ID -k $PRIV_KEY)
    tx1p=$($CLEOS convert pack_transaction "$tx1s")

echo $tx1a
    if [[ -z "$TXs" ]]; then
	TXs="[$tx1p"
    else    
	TXs="$TXs, $tx1p"
    fi

    echo -ne "$COUNTER/$MAX_TX\r"
done

echo "$TXs]" > tx_stress_test_$2.json

