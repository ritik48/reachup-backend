"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const db_1 = require("./utils/db");
const leads_routes_1 = require("./routes/leads.routes");
const agendaInit_1 = require("./utils/agendaInit");
const workflow_routes_1 = require("./routes/workflow.routes");
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static("uploads"));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH"],
}));
app.use("/auth", auth_routes_1.authRoute);
app.use("/user", user_routes_1.userRoute);
app.use("/leads", leads_routes_1.leadsRoute);
app.use("/workflow", workflow_routes_1.workflowRoute);
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;
    console.log({ status, message });
    res.status(status).json({
        message,
        success: false,
    });
});
(0, db_1.connectDB)()
    .then(() => {
    agendaInit_1.agenda.start().then(() => {
        console.log("Agenda started");
        app.listen(3000, () => console.log("LISTENING ON 3000"));
    });
})
    .catch((err) => {
    console.log("Cannot connect to databse ", err);
    process.exit(1);
});
