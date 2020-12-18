const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const userRoutes=require('./routes/user')
const adminRoutes=require('./routes/admin')
//set allow origin * for every request
app.use(cors());

//parse the form data and json for user input and attach to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const PORT = process.env.PORT || 4000; // if we didnt provide port
const MONGOSE_URL = process.env.MONGOSE_URL || "";
console.log("url", MONGOSE_URL);

app.use('/',userRoutes)
app.use('/admin',adminRoutes)

app.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT} `);

  //connect to database
  mongoose
    .connect(MONGOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected to database"))
    .catch((e) => console.error(`CANNOT CONNECT TO DATABASE ${e}`));
});
