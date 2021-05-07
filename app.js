require("dotenv").config();

const cors = require("cors");
const express = require("express");
const errorMiddleware = require("./middlewares/error");

const bankAccRouter = require("./routes/bankAccRoute");
const cardCodeRouter = require("./routes/cardCodeRoute");
const cardProductRouter = require("./routes/cardProductRoute");
const orderRouter = require("./routes/orderRoute");
const paymentRouter = require("./routes/paymentRoute");
const userRouter = require("./routes/userRoute");
const uploadImageRouter = require("./routes/uploadImageRouter");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", userRouter);
app.use("/upload", uploadImageRouter);
app.use("/orders", orderRouter);
app.use("/card-products", cardProductRouter);
app.use("/card-code", cardCodeRouter);
app.use("/bank-acc", bankAccRouter);
app.use("/payment", paymentRouter);

app.use("/", (req, res, next) => {
  res.status(404).json({ message: "PATH NOT FOUND" });
});

app.use(errorMiddleware);

// const { sequelize } = require("./models");
// sequelize.sync({ force: true }).then(() => console.log("DB sync"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`SERVER IS RUNNING ON PORT: ${PORT}`));
