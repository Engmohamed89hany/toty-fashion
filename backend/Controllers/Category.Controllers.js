const fs = require("fs");
const path = require("path");
const jsend = require("jsend");
const AsyncWrapper = require("../middleware/Wrapper");
const { db } = require("../config/ConnectDB");

const deleteImageFile = (imageName) => {
  if (!imageName) return;

  const imagePath = path.join(__dirname, "../images", imageName);

  fs.unlink(imagePath, (error) => {
    if (error && error.code !== "ENOENT") {
      console.error("Error deleting category image:", error);
    }
  });
};

const getAllCategories = AsyncWrapper(async (req, res) => {
  const parsePositiveInteger = (value, fallback, maximum = Number.MAX_SAFE_INTEGER) => {
    if (typeof value !== "string" || !/^\d+$/.test(value)) {
      return fallback;
    }

    const parsedValue = Number(value);
    return Number.isSafeInteger(parsedValue) && parsedValue > 0
      ? Math.min(parsedValue, maximum)
      : fallback;
  };

  const requestedPage = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 10, 100);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const whereQuery = search ? "WHERE title LIKE ?" : "";
  const filterParams = search ? [`%${search}%`] : [];
  const countQuery = `SELECT COUNT(*) AS totalCategories FROM category ${whereQuery}`;
  const [countRows] = await db.promise().execute(countQuery, filterParams);
  const totalCategories = Number(countRows[0]?.totalCategories ?? 0);
  const totalPages = Math.ceil(totalCategories / limit);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const skip = (page - 1) * limit;

  const categoryQuery = `
    SELECT id, title, decription, image, created_At, updated_At
    FROM category
    ${whereQuery}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;
  const [categories] = await db
    .promise()
    .execute(categoryQuery, [...filterParams, limit, skip]);

  return res.status(200).send(
    jsend.success({
      ok: true,
      pagination: {
        page,
        limit,
        totalCategories,
        totalPages,
      },
      categories,
    }),
  );
});
const getCategoryById = AsyncWrapper(async (req, res) => {
  const categoryId = req.params.id;
  const query = "SELECT * FROM category WHERE id = ?";
  db.query(query, [categoryId], (error, results) => {
    if (error) {
      console.error("Error fetching category:", error);
      return res
        .status(500)
        .json(jsend.error({ message: "Internal server error" }));
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json(jsend.error({ message: "Category not found" }));
    }
    res.status(200).json(jsend.success(results[0]));
  });
});
const createCategory = AsyncWrapper(async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;
  const query =
    "INSERT INTO category (title, decription, image) VALUES (?, ?, ?)";
  db.query(query, [title, description, image], (error, results) => {
    if (error) {
      console.error("Error creating category:", error);
      return res
        .status(500)
        .json(jsend.error({ message: "Internal server error" }));
    }
    res
      .status(201)
      .json(jsend.success({ id: results.insertId, title, description, image }));
  });
});
const updateCategory = AsyncWrapper(async (req, res) => {
  const categoryId = req.params.id;
  const { title, description } = req.body;
  const newImage = req.file ? req.file.filename : null;

  db.query(
    "SELECT * FROM category WHERE id = ?",
    [categoryId],
    (error, results) => {
      if (error) {
        console.error("Error fetching category for update:", error);
        return res
          .status(500)
          .json(jsend.error({ message: "Internal server error" }));
      }

      const oldCategory = results[0];

      if (!oldCategory) {
        return res
          .status(404)
          .json(jsend.error({ message: "Category not found" }));
      }

      const safeTitle = title || oldCategory.title;
      const safeDescription = description || oldCategory.decription;
      const imageToSave = newImage || oldCategory.image;

      db.query(
        "UPDATE category SET title = ?, decription = ?, image = ? WHERE id = ?",
        [safeTitle, safeDescription, imageToSave, categoryId],
        (updateError, updateResults) => {
          if (updateError) {
            console.error("Error updating category:", updateError);
            return res
              .status(500)
              .json(jsend.error({ message: "Internal server error" }));
          }

          if (updateResults.affectedRows === 0) {
            return res
              .status(404)
              .json(jsend.error({ message: "Category not found" }));
          }

          if (newImage && oldCategory.image && oldCategory.image !== newImage) {
            deleteImageFile(oldCategory.image);
          }

          return res.status(200).json(
            jsend.success({
              id: categoryId,
              title: safeTitle,
              description: safeDescription,
              image: imageToSave,
            }),
          );
        },
      );
    },
  );
});
const deleteCategory = AsyncWrapper(async (req, res) => {
  const categoryId = req.params.id;

  db.query(
    "SELECT image FROM category WHERE id = ?",
    [categoryId],
    (error, results) => {
      if (error) {
        console.error("Error finding category image:", error);
        return res
          .status(500)
          .json(jsend.error({ message: "Internal server error" }));
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json(jsend.error({ message: "Category not found" }));
      }

      const imageName = results[0]?.image;

      db.query(
        "DELETE FROM category WHERE id = ?",
        [categoryId],
        (deleteError, deleteResults) => {
          if (deleteError) {
            console.error("Error deleting category:", deleteError);
            return res
              .status(500)
              .json(jsend.error({ message: "Internal server error" }));
          }

          if (deleteResults.affectedRows === 0) {
            return res
              .status(404)
              .json(jsend.error({ message: "Category not found" }));
          }

          deleteImageFile(imageName);

          return res
            .status(200)
            .json(jsend.success({ message: "Category deleted successfully" }));
        },
      );
    },
  );
});
module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
