FROM ubuntu:16.04

COPY . /root
WORKDIR /root
RUN chmod -R 755 ./docker/bootstrap.sh
RUN /root/docker/bootstrap.sh
RUN npm i
RUN npm start
