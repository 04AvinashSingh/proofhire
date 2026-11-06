import { Router } from "express";
import { authRouter } from "./auth.js";
import { organisationsRouter } from "./organisations.js";
import { candidatesRouter } from "./candidates.js";
import { jobsRouter, orgJobsSubRouter } from "./jobs.js";
import { applicationsRouter } from "./applications.js";
import { aiRouter } from "./ai.js";

const v1Router = Router();

v1Router.get("/", (_req, res) => {
  res.json({
    message: "ProofHire Core API v1",
    documentation: "/docs",
  });
});

v1Router.use("/auth", authRouter);
v1Router.use("/organisations", organisationsRouter);
v1Router.use("/candidates", candidatesRouter);
v1Router.use("/jobs", jobsRouter);
v1Router.use("/organisations/:orgId/jobs", orgJobsSubRouter);
v1Router.use(applicationsRouter);
v1Router.use(aiRouter);

export { v1Router };
