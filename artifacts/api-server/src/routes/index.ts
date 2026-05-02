import { Router, type IRouter } from "express";
import healthRouter from "./health";
import moodRouter from "./mood";
import notificationsRouter from "./notifications";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(moodRouter);
router.use(notificationsRouter);
router.use(openaiRouter);

export default router;
