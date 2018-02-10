FROM ubuntu:16.04

RUN apt-get update && apt-get install -y apt-utils && \
    apt-get -y upgrade && \
    apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get update && apt-get -y install \
        nodejs \
        varnish

WORKDIR /var/www/html

COPY bin/startup* /opt/
RUN chmod ug+x /opt/startup*
CMD ["bash", "/opt/startup.sh"]

EXPOSE 4711
