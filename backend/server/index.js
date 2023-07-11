// server/index.js

const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3001;

const app = express();
 
// Website you wish to allow to connect
app.use(
  cors({
    origin: '*', 
    credentials:true
  })
);

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});