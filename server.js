const http = require("http");
const chalk = require("chalk");
const app = require("./app");


const PORT = process.env["PORT"] ?? 8080;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(
    chalk.blueBright("Server is listening on PORT:"),
    chalk.yellow(PORT),
    chalk.blueBright("Get your shopping on!")
  );
});
