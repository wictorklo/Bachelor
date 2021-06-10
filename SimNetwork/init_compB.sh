sudo apt install net-tools -y
sed -ie '/^XKBLAYOUT=/s/".*"/"dk"/' /etc/default/keyboard && udevadm trigger --subsystem-match=input --action=change
sudo route add -net 10.0.10.0 netmask 255.255.255.0 gw 192.168.1.101 eth1