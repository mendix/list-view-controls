(apt-get update -y) && \
(apt-get -y install sudo) && \
(apt-get install -y --no-install-recommends software-properties-common build-essential sudo git openssh-client curl wget) && \
(curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -) && \
(sudo apt-get install -y nodejs)
