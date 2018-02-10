FROM ubuntu:16.04

# Install yarn
RUN apt-get update && apt-get install -y apt-utils && \
    apt-get -y upgrade && \
    apt-get update && apt-get install -y curl apt-transport-https && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get -y install \
        nodejs \
        yarn

WORKDIR /app

CMD yarn install