const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/testRoutes");
const app = express();


app.use(helmet());


app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://backend.onrender.com"
    ],
    credentials: true,
}));


app.use(express.json());


app.use(express.urlencoded({
    extended: true
}));


app.use(cookieParser());


app.use(morgan("dev"));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);



app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "TRC POS API Running..."
    });
});


module.exports = app;