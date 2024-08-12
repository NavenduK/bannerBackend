import { Router } from "express";
import BannerController from "../controllers/banner.controller";
import upload from "../middleware/upload";

class TutorialRoutes {
  router = Router();
  controller = new BannerController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/", this.controller.create);

    this.router.get("/", this.controller.findAllActive);
    
    this.router.get("/all", this.controller.findAll);

    this.router.put("/:id", this.controller.update);

    this.router.delete("/:id", this.controller.delete);

    this.router.delete("/", this.controller.deleteAll);

    this.router.post('/upload', upload.single('file'), this.controller.uploadToCloudinary.bind(this));
  }
}

export default new TutorialRoutes().router;
