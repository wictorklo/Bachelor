echo 1 | sudo tee -a /proc/sys/net/ipv4/ip_forward
sudo iptables -A FORWARD -i eth1 -d 192.168.1.0/24 -o eth2 -j ACCEPT
sudo iptables -A FORWARD -i eth2 -d 10.0.10.0/24 -o eth1 -j ACCEPT
sudo iptables -A FORWARD -j ACCEPT
sudo route add -net 192.168.1.0 netmask 255.255.255.0 gw 192.168.2.102 eth2
mkdir Website
cp -R /home/vagrant/common/Website/* /home/vagrant/Website
echo "website folder copied"
mkdir Solidity
cp -R /home/vagrant/common/Solidity/* /home/vagrant/Solidity
echo "solidity folder copied"
mkdir Blockchain
cp -R /home/vagrant/common/Blockchain/* /home/vagrant/Blockchain
echo "blockchain folder copied"
cd Blockchain
sudo rm -rf geth/
sudo ./init.bat
sudo bootnode -nodekey geth/nodekey -writeaddress | sudo tee /home/vagrant/common/Blockchain/enodeA.txt
printf "@192.168.2.101:30303" | sudo tee -a /home/vagrant/common/Blockchain/enodeA.txt
sudo screen -S geth -d -m bash -c "sudo ./boot_miner.bat"
cd ..
sudo screen -S website -d -m bash -c "sleep 10; cd Solidity; sudo node deploy.js; cd ../Website; node server.js"