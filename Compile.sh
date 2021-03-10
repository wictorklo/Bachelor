solcjs --bin --abi -o ./build *.sol

ADDR=$(node deploy.js | tail -n 1)
OLDADDR=$(grep -e "const contractAddr" index.html | grep -o -E "0x[a-zA-Z0-9]*")
echo $ADDR
echo $OLDADDR

replace $OLDADDR $ADDR -- index.html

