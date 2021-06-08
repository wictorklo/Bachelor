sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
echo "mysql-server mysql-server/root_password password root" | sudo debconf-set-selections
echo "mysql-server mysql-server/root_password_again password root" | sudo debconf-set-selections
sudo apt-get install ethereum nodejs-legacy npm git mysql-server-5.5 mysql-server -y
npm config set strict-ssl false
sudo npm install -g n
sudo n stable
PATH="$PATH"
mysql -u root -proot < /home/vagrant/common/SimNetwork/database.sql