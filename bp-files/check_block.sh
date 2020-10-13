#!/bin/bash

CLEOS=/opt/eosio/producer/bin/cleos
API=http://127.0.0.1:8888

$CLEOS -u $API get block $1 | jq -r ".transactions[].cpu_usage_us" > temp_cpu_data

counter=0
max=0
sum=0

while read p; do
	if (( counter == 0 )); then
		min=$p
	else
		if (( p < min )); then
			min=$p
		fi
		if (( p > max )); then
			max=$p
		fi
	fi
	((sum+=p))
	((counter++))
done <temp_cpu_data

max_block_cpu=$($CLEOS -u $API get table eosio eosio global | jq ".rows[].max_block_cpu_usage")

avg=$(echo "scale=2; $sum/$counter" | bc -l)
blk_pct=$(echo "scale=2; $sum/$max_block_cpu * 100" | bc -l)

echo "Transaction count: $counter"
echo "Minimum CPU usage: $min"
echo "Maximum CPU usage: $max"
echo "Average CPU usage: $avg"
echo "Total block usage: ${sum} us (${blk_pct}% filled)"

rm temp_cpu_data
