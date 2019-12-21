const http = require("http");

const server = http.createServer();

server.on("request", (req, res) => {
  res.end(`<!DOCTYPE html><html><head><title>Application</title></head><body>Hello world</body></html>`)
})

server.on("listening", () => {
  console.log("Server listening on http://localhost:80");
})

server.listen(80);
