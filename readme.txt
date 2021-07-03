Folder/file structure:
- SimNetwork: The setup and configurations for the complete simulated network
	* database.sql - Creating the database and adding two accounts (see below)
	* init_*.sh - Installing the programs and setting up the configuration for the machines
- Blockchain: The files needed for the private blockchain to run
	* init.bat - Setting up the initial empty blockchain
	* boot.bat - Starting a node that does not mine but can send and receive data
	* boot_miner.bat - Same, but now also mines as an authorised user.
	* genesis.json - The blockchain configuration
- Solidity: All scripts that only interact with the blockchain
	* deploy.js - Compiles all solidity source files and deploys them onto the blockchain
	* solcjs - Solidity compiler
	* testData.js - Generates data for transactions on the blockchain (Usage: node testData [contract name] [method name] [new/account index])
	Solidity/ - All solidity source code
- Website: All scripts and templates used to run the website
	* server.js - The script that is running the actual server (Usage: node server.js)
	* public/ - The template files, and all js/css used on the website

Preconfigured accounts (Username/Password):
admin/admin
abc/def

Setup:
Install Geth, MySQL and Node.js
Create a local MySQL database running on localhost with username/password: root/root
Run database.sql from the SimNetwork folder to set up the database
Open the Website folder in a terminal
Execute the following commands:
- npm config set strict-ssl false
- npm install -g n
- n stable
- npm install
Repeat in the Solidity folder
cd into the Blockchain folder
Run init.bat
Run Boot_Miner.bat
In another terminal, cd into the Solidity folder
Execute "node deploy.js"
Once finished, cd into the Website folder
Execute "node server.js"
In a browser, connect using URL "localhost:8080"

Alternative:
Install Vagrant
cd into the SimNetwork folder
run "vagrant up"
For machines Alice, Bob and Charlie, open up firefox and enter URL "10.0.10.101:8080"
For machines David, Eve and Frank, open up firefox and enter URL "192.168.1.101:8080"