const app = require("./app.js");

//PORT
const port = process.env.PORT;

// Listen PORT
app.listen(port, () => {
  console.log(`The Server is Listening on port ${port}`);
});
