FROM alpine:latest

RUN apk add --no-cache unzip ca-certificates curl

# Download pocketbase
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.36.5/pocketbase_0.36.5_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip

# Optional: ensure it is executable
RUN chmod +x /pb/pocketbase

EXPOSE 8090

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data"]
