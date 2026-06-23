# Frontend
FROM node:24.17.0-alpine3.23 AS frontend
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Backend
FROM golang:1.26.4-alpine3.23 AS backend
ENV CGO_ENABLED=1
RUN apk add --no-cache gcc musl-dev sqlite-dev
WORKDIR /app
COPY go.mod go.sum main.go ./
RUN go mod download
RUN mkdir server
COPY server/ ./server/
RUN go build -o LetheCrypt .

FROM alpine:3.23
RUN apk add --no-cache sqlite-libs
WORKDIR /app
COPY --from=backend /app/LetheCrypt ./LetheCrypt
RUN chmod a+x ./LetheCrypt
RUN mkdir -p ./client/
COPY --from=frontend /app/client/dist/ ./client/dist/
EXPOSE 8000
CMD ["./LetheCrypt"]
