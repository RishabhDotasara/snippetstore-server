import express from "express"
import profileRouter from "./profile/routes";
import codeRouter from "./code-snippets/routes";
import searchRouter from "./search/routes"

const v1Router = express.Router();

v1Router.use("/profile", profileRouter);

v1Router.use("/code", codeRouter);

v1Router.use("/search", searchRouter)
export default v1Router;