solcjs --bin --abi -o ./build Solidity/*.sol
ADDR=$(node deploy.js | tail -n 1)
OLDADDR=$(grep -e "const contractAddr" index.ejs | grep -o -E "0x[a-zA-Z0-9]*")
echo $ADDR
echo $OLDADDR
sed -i "s/$OLDADDR/$ADDR/g" index.ejs
echo "ADDRESS CHANGED"
ABI=$(cat build/main_sol_Main.abi)
OLDABI=$(grep -e "const ABI =" index.ejs | grep -o -E "\[.+\]")
echo $ABI
echo " --- "
echo $OLDABI
sed -i "s/$OLDABI/$ABI/g" index.ejs
echo "ABI CHANGED"