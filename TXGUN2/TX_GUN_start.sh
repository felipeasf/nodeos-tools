#!/bin/bash
################################################################################
#
# TX GUN
# Scrip Created by http://CryptoLions.io
# For EOS Junlge 2.0 testnet
#
# https://github.com/CryptoLions/
#
################################################################################

TXS_PER_PUSH=$( jq -r '.TXS_PER_PUSH' "CONFIG.json" )
THREADS=$( jq -r '.THREADS' "CONFIG.json" )

CLEOSBIN=$( jq -r '.CLEOSBIN' "CONFIG.json" )

REPEAT="$( jq -r '.REPEAT' "CONFIG.json" )"
#="$( jq -r '.' "CONFIG.json" )"

ENDPOINT="$( jq -r '.ENDPOINT' CONFIG.json )"
ENDPOINT2="$( jq -r '.ENDPOINT2' CONFIG.json )"

CLEOS="$CLEOSBIN/cleos -u $ENDPOINT"
CLEOS2="$CLEOSBIN/cleos -u $ENDPOINT2"


RCOUNTER=0

while [  $RCOUNTER -lt $REPEAT ]; do
    let RCOUNTER=RCOUNTER+1 
    echo "Iteration: $RCOUNTER / $REPEAT"

    TCOUNTER=0
    echo "Preparing TXs [Loading gun]..."
    while [  $TCOUNTER -lt $THREADS ]; do
	let TCOUNTER=TCOUNTER+1 
	./prepareTX.sh $TXS_PER_PUSH $TCOUNTER &
    done

    wait



    echo "Waiting till start of *0 or *5 minute..."
    mmss=$(($((4 - $((10#$(date +%M))) % 5))*60))
    ssss=$((mmss +  60  - $(date +%s) % 60))
    COUNTER=$ssss

    while [  $COUNTER -gt 2 ]; do
        sleep 0.2


	mmss=$(($((4 - $(($(date +%M)*1)) % 5))*60))

	ssss=$((mmss + 60  - $(date +%s) % 60))
	COUNTER=$ssss
	echo -ne "Shooting in: $(($COUNTER-1)) seconds \r"
    done

    echo ""

    echo "Shooting..."

    TCOUNTER=0
    while [  $TCOUNTER -lt $THREADS ]; do
	let TCOUNTER=TCOUNTER+1 
	$CLEOS2 push transactions tx_stress_test_$TCOUNTER.json 2>&1 > tx_stress_$TCOUNTER.log &
    done

    wait
    echo "--------------Done--------------------"
    sleep 1

done


echo "DONE"
