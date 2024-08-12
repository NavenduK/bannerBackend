import { OkPacket, RowDataPacket } from "mysql2";
import connection from "../db";
import { Banner } from "../models/banner.model";

interface IBannerRepository {
  save(banner: Banner): Promise<Banner>;
  retrieveAll(searchParams: { description?: string; active?: boolean }): Promise<Banner[]>;
  retrieveById(bannerId: number): Promise<Banner | undefined>;
  update(banner: Banner): Promise<number>;
  delete(bannerId: number): Promise<number>;
  deleteAll(): Promise<number>;
}

class BannerRepository implements IBannerRepository {
  save(banner: Banner): Promise<Banner> {
    return new Promise((resolve, reject) => {
      connection.query<OkPacket>(
        "INSERT INTO banners (description, duration, active, image, link) VALUES (?, ?, ?, ?, ?)",
        [banner.description, banner.duration, banner.active, banner.image, banner.link],
        (err, res) => {
          if (err) reject(err);
          else
            this.retrieveById(res.insertId)
              .then((banner) => {
                if (banner) {
                  resolve(banner);
                } else {
                  reject(new Error("Failed to retrieve the newly inserted banner."));
                }
              })
              .catch(reject);
        }
      );
    });
  }

  retrieveAll(searchParams: { description?: string; active?: boolean }): Promise<Banner[]> {
    let query: string = "SELECT * FROM banners";
    let conditions: string[] = [];
    let values: any[] = [];

    if (searchParams.active !== undefined) {
      conditions.push("active = ?");
      values.push(searchParams.active);
    }

    if (searchParams.description) {
      conditions.push(`LOWER(description) LIKE ?`);
      values.push(`%${searchParams.description.toLowerCase()}%`);
    }

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    return new Promise((resolve, reject) => {
      connection.query<RowDataPacket[]>(query, values, (err, rows) => {
        if (err) reject(err);
        else {
          const banners = rows.map(row => this.mapRowToBanner(row));
          resolve(banners);
        }
      });
    });
  }

  retrieveById(bannerId: number): Promise<Banner | undefined> {
    return new Promise((resolve, reject) => {
      connection.query<RowDataPacket[]>(
        "SELECT * FROM banners WHERE id = ?",
        [bannerId],
        (err, rows) => {
          if (err) reject(err);
          else {
            if (rows.length) {
              resolve(this.mapRowToBanner(rows[0]));
            } else {
              resolve(undefined); // Explicitly handle the case where no rows are found
            }
          }
        }
      );
    });
  }

  update(banner: Banner): Promise<number> {
    if (!banner.id) {
      return Promise.reject(new Error("Banner ID is required for update."));
    }
    
    return new Promise((resolve, reject) => {
      connection.query<OkPacket>(
        "UPDATE banners SET description = ?, duration = ?, active = ?, image = ?, link = ? WHERE id = ?",
        [banner.description, banner.duration, banner.active, banner.image, banner.link, banner.id],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }

  delete(bannerId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      connection.query<OkPacket>(
        "DELETE FROM banners WHERE id = ?",
        [bannerId],
        (err, res) => {
          if (err) reject(err);
          else resolve(res.affectedRows);
        }
      );
    });
  }

  deleteAll(): Promise<number> {
    return new Promise((resolve, reject) => {
      connection.query<OkPacket>("DELETE FROM banners", (err, res) => {
        if (err) reject(err);
        else resolve(res.affectedRows);
      });
    });
  }

  private mapRowToBanner(row: RowDataPacket): Banner {
    return {
      id: row.id,
      description: row.description,
      duration: row.duration ? new Date(row.duration) : undefined,
      active: row.active,
      image: row.image,
      link: row.link
    };
  }
}

export default new BannerRepository();
