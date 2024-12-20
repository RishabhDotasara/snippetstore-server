import express from "express"

const profileRouter = express.Router();

// @ts-ignore
profileRouter.get("/", (req, res) => {
    res.json({ message: "Welcome to the profile route" });
});

export default profileRouter;