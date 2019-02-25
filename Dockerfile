FROM node:10

WORKDIR /usr/src
COPY src ./

RUN apt-get -y update
RUN apt-get -y install imagemagick ghostscript poppler-utils
RUN npm install

EXPOSE 3002

CMD ["node", "index.js"]