import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import expensesRouter from "./expenses";
import categoriesRouter from "./categories";
import budgetsRouter from "./budgets";
import goalsRouter from "./goals";
import reportsRouter from "./reports";
import receiptsRouter from "./receipts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(expensesRouter);
router.use(categoriesRouter);
router.use(budgetsRouter);
router.use(goalsRouter);
router.use(reportsRouter);
router.use(receiptsRouter);

export default router;
