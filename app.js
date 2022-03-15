const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const userRoutes=require('./routes/routes')
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = process.env.PORT || 3000; 
//const MONGOSE_URL = process.env.DATABASE_URL;
const MONGOSE_URL = process.env.MONGOSE_URL;
console.log("url", MONGOSE_URL);
app.use('/',userRoutes)
app.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT} `);
  mongoose
    .connect(MONGOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected to database"))
    .catch((e) => console.error(`CANNOT CONNECT TO DATABASE ${e}`));
});

