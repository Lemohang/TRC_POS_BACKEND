require("./dns-fix");
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {
        console.log("================================");
        console.log(`Server running on Port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log("================================");
    });

};

startServer();