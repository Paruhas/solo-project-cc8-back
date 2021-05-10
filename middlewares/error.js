module.exports = (err, req, res, next) => {
  // console.log(err);
  if (process.env.NODE_ENV === "development") {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError")
      return res.status(401).json({ msg: err.message }); // ดัก Error จากการ Auth Token
    if (err.name === "SequelizeValidationError")
      return res.status(400).json({ msg: err.message });
  } else {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError")
      return res.status(401).json({ msg: "You are unauthorized" });
    if (err.name === "SequelizeValidationError")
      return res.status(400).json({ msg: "You are unauthorized" });
  }
  console.log(err);
  res.status(500).json({ messageError: err.message });
};
