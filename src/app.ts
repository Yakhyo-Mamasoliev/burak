import express from "express"; // Import the Express framework
import path from "path"; // Import the path module for handling file paths
import router from "./router"; // Import the main application router
import routerAdmin from "./router-admin"; // Import the admin-specific router
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

/* 1-ENTRANCE */
const app = express(); // Create an instance of an Express application
app.use(express.static(path.join(__dirname, "public"))); // give access to all folders in 'public' folder
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (form data)
app.use(express.json()); // Parse JSON bodies
app.use(morgan(MORGAN_FORMAT));

/* 2-SESSIONS*/
app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 60 * 60 * 6, // 6 hours
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});

/* 3-VIEWS*/
app.set("views", path.join(__dirname, "views")); // Set the directory for the view templates
app.set("view engine", "ejs"); // Set EJS as the view engine

/* 4-ROUTERS*/
app.use("/admin", routerAdmin); // Use the admin router for routes starting with '/admin' (SSR: EJS (Admin))
app.use("/", router); // Use the main router for the root and other routes (SPA: REACT)// 1. We use SPA (Single Page Application) as a REST API server for REACT used by users// 2. Building Admin Site -SSR (ServerSideRendering)// building the frontend in the backend (in the EJS framework)

export default app; // Export the app instance for use in other files
