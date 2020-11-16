#!/bin/bash

# This script will install everything Solaris needs to run on a brand new Ubuntu (20.04) server. It installs:
# - git
# - openssh-server
# - nodejs
# - mongodb
#
# Then clones Solaris and installs the dependencies.
#
# It does not:
# - Open the site to the internet.
# - Run the Solaris server or client. See the README for startup instructions.
#
# Further reading:
# - Consider using code-server in conjunction with this setup. This will allow for remote development on a VPS for example instead of locally: https://github.com/cdr/code-server

sudo apt update

# Install git
sudo apt install -y git

# Install ssh
sudo apt install -y openssh-server
sudo ufw allow ssh

# Install nodejs
sudo apt install -y nodejs npm

# Install mongodb (Ubuntu 20.04)
sudo wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -

echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

sudo apt-get update
sudo apt-get install -y mongodb-org

sudo systemctl start mongod
sudo systemctl enable mongod

# Setup Solaris
cd ~

git clone https://github.com/mike-eason/solaris.git

cd solaris/client
cp .env.example .env
npm i

cd ../server
cp .env.example .env
npm i

cd ~
