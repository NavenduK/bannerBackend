import { Application } from "express";
import bannerRoutes from "./banner.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api", bannerRoutes);
  }
}
