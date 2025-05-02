const app = require("./app/express_server");
const { PORT = 10000 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));