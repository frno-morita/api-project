# api-project
Simple NodeJS project with Docker

## Prerequisites
In order to run this project you will need to have Docker and docker-compose installed

Linux/Unix
```
apt-get install -y docker docker-compose docker-registry
```

## How to run
In order to install the project you run the install script from the project root directory.

```
./dev/install.sh
```

When yarn has installed the node-modules that this project depends on, you can start the containers with the start script from the project root directory.

```
./dev/start.sh
```

## Extra commands

To stop the services you can run the stop script from the project root directory.

```
./dev/stop.sh
```

In order to flush the Redis cache you can run the following command from the project root directory.

```
docker-compose exec redis redis-cli FLUSHALL
```
