// Generic Import
require("./db/mongoose");
const express = require("express");
const morgan = require("morgan");


// Import Routers

const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

// App-Express

const app = express();

// Middlewares

// app.use((req, res, next) => {
//   if( req.method ) {
//     return res.status(503).send('Actually our database is in maintenance, come back later!')
//   }
//   next();
// });

app.use(express.json());
app.use(morgan('dev'));

// Router Middlewares

app.use(userRouter);
app.use(taskRouter);

//PORT

const port = process.env.PORT || 3000;

// Listen PORT

app.listen(port, () => {
  console.log(`The Server is Listening on port ${port}`);
});



// /** Jsonwebtoken example */
// const jwt = require('jsonwebtoken');

// const myFunction = async () => {
//     // Creating a token
//     const token = jwt.sign(
//       {_id: 'abc123'},
//       'thisismynewcourse',
//       { expiresIn: '1h'}
//       );
//     console.log(token);

//     //Verifying a token

//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data);
// }

// myFunction();