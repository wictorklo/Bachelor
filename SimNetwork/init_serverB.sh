echo 1 | sudo tee -a /proc/sys/net/ipv4/ip_forward
sudo iptables -A FORWARD -i eth1 -d 10.0.10.0/24 -o eth2 -j ACCEPT
sudo iptables -A FORWARD -i eth2 -d 192.168.1.0/24 -o eth1 -j ACCEPT
sudo iptables -A FORWARD -j ACCEPT
sudo route add -net 10.0.10.0 netmask 255.255.255.0 gw 192.168.2.101 eth2