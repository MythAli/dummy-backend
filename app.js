const express = require("express");
const cors = require("cors");
const userRouter = require("./userRoutes");
const clubsRouter = require("./clubsRoutes");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
// for pushing
app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api", userRouter);
app.use("/clubs", clubsRouter);

app.get("/", (req, res) => {
  res.json("Hello There, it worked again & again!");
});

app.listen(port, () => {
  console.log(`Server running at port http://localhost:${port}`);
});
