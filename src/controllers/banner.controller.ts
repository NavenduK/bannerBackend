import { Request, Response } from "express";
import { Banner } from "../models/banner.model";
import bannerRepository from "../repositories/banner.repository";
import cloudinary from "../config/cloudinary.config";
import { FileRequest } from "../middleware/upload"; 

export default class BannerController {
  async create(req: Request, res: Response) {
    if (!req.body.description) {
      res.status(400).send({
        message: "Description cannot be empty!"
      });
      return;
    }

    if(!req.body.image){
      res.status(400).send({
        message: "Image cannot be empty!"
      });
      return;
    }

    if(!req.body.link){
      res.status(400).send({
        message: "Link cannot be empty!"
      });
      return;
    }

    if(!req.body.duration){
      res.status(400).send({
        message: "Duration cannot be empty!"
      });
      return;
    }

    try {
      const banner: Banner = {
        description: req.body.description,
        duration: req.body.duration ? new Date(req.body.duration) : undefined,
        active: true,
        image: req.body.image,
        link: req.body.link
      };

      const savedBanner = await bannerRepository.save(banner);

      res.status(201).send(savedBanner);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while creating the banner."
      });
    }
  }

  async findAll(req: Request, res: Response) {

    try {
      const banners = await bannerRepository.retrieveAll({});

      res.status(200).send(banners);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving banners."
      });
    }
  }

  async findOne(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    try {
      const banner = await bannerRepository.retrieveById(id);

      if (banner) res.status(200).send(banner);
      else
        res.status(404).send({
          message: `Cannot find Banner with id=${id}.`
        });
    } catch (err) {
      res.status(500).send({
        message: `Error retrieving Banner with id=${id}.`
      });
    }
  }

  async update(req: Request, res: Response) {
    let banner: Banner = {
      id: parseInt(req.params.id),
      description: req.body.description,
      duration: req.body.duration ? new Date(req.body.duration) : undefined,
      active: req.body.active,
      image: req.body.image,
      link: req.body.link
    };

    try {
      const num = await bannerRepository.update(banner);

      if (num === 1) {
        res.send({
          message: "Banner was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Banner with id=${banner.id}. Maybe Banner was not found or req.body is empty!`
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Error updating Banner with id=${banner.id}.`
      });
    }
  }

  async delete(req: Request, res: Response) {
    const id: number = parseInt(req.params.id);

    try {
      const num = await bannerRepository.delete(id);

      if (num === 1) {
        res.send({
          message: "Banner was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Banner with id=${id}. Maybe Banner was not found!`,
        });
      }
    } catch (err) {
      res.status(500).send({
        message: `Could not delete Banner with id=${id}.`
      });
    }
  }

  async deleteAll(req: Request, res: Response) {
    try {
      const num = await bannerRepository.deleteAll();

      res.send({ message: `${num} Banners were deleted successfully!` });
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while removing all banners."
      });
    }
  }

  async findAllActive(req: Request, res: Response) {
    try {
      const banners = await bannerRepository.retrieveAll({ active: true });

      res.status(200).send(banners);
    } catch (err) {
      res.status(500).send({
        message: "Some error occurred while retrieving active banners."
      });
    }
  }


  async uploadToCloudinary(req: Request, res: Response) {
    const fileRequest = req as FileRequest; 

    if (!fileRequest.file) {
      return res.status(400).send({ message: 'No file uploaded.' });
    }

    cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
      if (error) {
        return res.status(500).send({ message: 'Upload to Cloudinary failed.', error });
      }

      res.status(200).send({ message: 'File uploaded successfully!', url: result?.secure_url });
    }).end(fileRequest.file.buffer); 
  }
}
