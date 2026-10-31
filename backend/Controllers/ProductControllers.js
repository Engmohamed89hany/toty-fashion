const fs = require("fs");
const path = require("path");
const jsend = require("jsend");
const AsyncWrapper = require("../middleware/Wrapper");
const { db } = require("../config/ConnectDB");

const parsePositiveInteger = (
  value,
  fallback,
  maximum = Number.MAX_SAFE_INTEGER,
) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) && parsedValue > 0
    ? Math.min(parsedValue, maximum)
    : fallback;
};

const parseProductId = (value) => {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const productId = Number(value);
  return Number.isSafeInteger(productId) && productId > 0 ? productId : null;
};

const getProductImages = async (productIds) => {
  if (productIds.length === 0) {
    return [];
  }

  const placeholders = productIds.map(() => "?").join(", ");
  const [images] = await db
    .promise()
    .execute(
      `SELECT id, product_id, imageurl FROM product_images WHERE product_id IN (${placeholders}) ORDER BY id`,
      productIds,
    );
  return images;
};

const groupImagesByProduct = (images) => {
  const imagesByProduct = new Map();
  for (const image of images) {
    const productImages = imagesByProduct.get(image.product_id) ?? [];
    productImages.push(image);
    imagesByProduct.set(image.product_id, productImages);
  }
  return imagesByProduct;
};

const deleteUploadedFiles = (files) => {
  for (const file of files) {
    fs.unlink(path.join(__dirname, "../images", file.filename), (error) => {
      if (error && error.code !== "ENOENT") {
        console.error("Error deleting uploaded product image:", error);
      }
    });
  }
};

const insertProductImages = async (productId, files) => {
  if (files.length === 0) {
    return [];
  }

  const values = files.map(() => "(?, ?)").join(", ");
  const params = files.flatMap((file) => [
    productId,
    `/images/${file.filename}`,
  ]);
  await db
    .promise()
    .execute(
      `INSERT INTO product_images (product_id, imageurl) VALUES ${values}`,
      params,
    );

  return getProductImages([productId]);
};

const getAllProducts = AsyncWrapper(async (req, res) => {
  const requestedPage = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 10, 100);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const categoryId =
    typeof req.query.category_id === "string"
      ? parsePositiveInteger(req.query.category_id, null)
      : null;

  if (req.query.category_id && !categoryId) {
    return res
      .status(400)
      .send(jsend.error({ message: "category_id must be a positive integer" }));
  }

  const filters = [];
  const filterParams = [];
  if (search) {
    filters.push("name LIKE ?");
    filterParams.push(`%${search}%`);
  }
  if (categoryId) {
    filters.push("category_id = ?");
    filterParams.push(categoryId);
  }
  const whereQuery = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  const [countRows] = await db
    .promise()
    .execute(
      `SELECT COUNT(*) AS totalProducts FROM products ${whereQuery}`,
      filterParams,
    );
  const totalProducts = Number(countRows[0]?.totalProducts ?? 0);
  const totalPages = Math.ceil(totalProducts / limit);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const skip = (page - 1) * limit;
  const [products] = await db.promise().execute(
    `SELECT products.id, products.name, products.description, products.price, products.discount, products.stock, products.size, products.category_id, category.title
     FROM products inner join category on products.category_id = category.id ${whereQuery} ORDER BY id DESC LIMIT ? OFFSET ?`,
    [...filterParams, limit, skip],
  );
  const images = await getProductImages(products.map((product) => product.id));
  const imagesByProduct = groupImagesByProduct(images);

  return res.status(200).send(
    jsend.success({
      products: products.map((product) => ({
        ...product,
        images: imagesByProduct.get(product.id) ?? [],
      })),
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
      },
    }),
  );
});

const getProduct = AsyncWrapper(async (req, res) => {
  const productId = parseProductId(req.params.id);
  if (!productId) {
    return res.status(400).send(jsend.error({ message: "Invalid product ID" }));
  }

  const [products] = await db.promise().execute(
    `SELECT products.id, products.name, products.description, products.price,
            products.discount, products.stock, products.size, products.category_id,
            category.title
       FROM products
       INNER JOIN category ON products.category_id = category.id
       WHERE products.id = ?`,
    [productId],
  );
  if (products.length === 0) {
    return res.status(404).send(jsend.error({ message: "Product not found" }));
  }

  const images = await getProductImages([productId]);
  return res.status(200).send(
    jsend.success({
      product: {
        ...products[0],
        images,
      },
    }),
  );
});

const validateProductValues = (values, { partial = false } = {}) => {
  const errors = [];
  const required = (field) => !partial || Object.hasOwn(values, field);

  if (required("name")) {
    if (typeof values.name !== "string" || !values.name.trim()) {
      errors.push("name is required");
    } else if (values.name.trim().length > 255) {
      errors.push("name must not exceed 255 characters");
    }
  }

  if (required("description")) {
    if (typeof values.description !== "string" || !values.description.trim()) {
      errors.push("description is required");
    }
  }

  if (required("price")) {
    const price = Number(values.price);
    if (!Number.isFinite(price) || price < 0 || price > 99999999.99) {
      errors.push("price must be between 0 and 99999999.99");
    }
  }

  if (required("discount")) {
    const discount =
      values.discount === undefined ? 0 : Number(values.discount);
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      errors.push("discount must be between 0 and 100");
    }
  }

  if (required("stock")) {
    const stock = Number(values.stock);
    if (!Number.isSafeInteger(stock) || stock < 0 || stock > 2147483647) {
      errors.push("stock must be an integer between 0 and 2147483647");
    }
  }

  if (required("size")) {
    if (
      typeof values.size !== "string" ||
      !values.size.trim() ||
      values.size.trim().length > 100
    ) {
      errors.push("size is required and must not exceed 100 characters");
    }
  }

  const categoryValue = values.category_id ?? values.categoryId;
  if (!partial || categoryValue !== undefined) {
    const parsedCategoryId = Number(categoryValue);
    if (
      !/^\d+$/.test(String(categoryValue ?? "")) ||
      !Number.isSafeInteger(parsedCategoryId) ||
      parsedCategoryId < 1
    ) {
      errors.push("category_id must be a positive integer");
    }
  }

  return errors;
};

const categoryExists = async (categoryId) => {
  const [categories] = await db
    .promise()
    .execute("SELECT id FROM category WHERE id = ?", [categoryId]);
  return categories.length > 0;
};

const createProduct = AsyncWrapper(async (req, res) => {
  const values = req.body ?? {};
  const files = req.files ?? [];
  const validationErrors = validateProductValues(values);
  if (validationErrors.length > 0) {
    deleteUploadedFiles(files);
    return res
      .status(400)
      .send(
        jsend.error({
          message: "Invalid product data",
          errors: validationErrors,
        }),
      );
  }

  const categoryId = Number(values.category_id ?? values.categoryId);
  if (!(await categoryExists(categoryId))) {
    deleteUploadedFiles(files);
    return res
      .status(400)
      .send(jsend.error({ message: "The selected category does not exist" }));
  }

  let productId;
  try {
    const [result] = await db.promise().execute(
      `INSERT INTO products (name, description, price, discount, stock, size, category_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        values.name.trim(),
        values.description.trim(),
        Number(values.price),
        Number(values.discount ?? 0),
        Number(values.stock),
        values.size.trim(),
        categoryId,
      ],
    );
    productId = result.insertId;

    const images = await insertProductImages(productId, files);
    return res.status(201).send(
      jsend.success({
        message: "Product created successfully",
        product: {
          id: productId,
          name: values.name.trim(),
          description: values.description.trim(),
          price: Number(values.price),
          discount: Number(values.discount ?? 0),
          stock: Number(values.stock),
          size: values.size.trim(),
          category_id: categoryId,
          images,
        },
      }),
    );
  } catch (error) {
    if (productId) {
      await db
        .promise()
        .execute("DELETE FROM products WHERE id = ?", [productId]);
    }
    deleteUploadedFiles(files);
    throw error;
  }
});

const updateProduct = AsyncWrapper(async (req, res) => {
  const productId = parseProductId(req.params.id);
  if (!productId) {
    deleteUploadedFiles(req.files ?? []);
    return res.status(400).send(jsend.error({ message: "Invalid product ID" }));
  }

  const files = req.files ?? [];
  const [products] = await db
    .promise()
    .execute("SELECT * FROM products WHERE id = ?", [productId]);
  if (products.length === 0) {
    deleteUploadedFiles(files);
    return res.status(404).send(jsend.error({ message: "Product not found" }));
  }

  const currentProduct = products[0];
  const values = { ...req.body };
  if (values.categoryId !== undefined && values.category_id === undefined) {
    values.category_id = values.categoryId;
  }
  const validationErrors = validateProductValues(values, { partial: true });
  if (validationErrors.length > 0) {
    deleteUploadedFiles(files);
    return res
      .status(400)
      .send(
        jsend.error({
          message: "Invalid product data",
          errors: validationErrors,
        }),
      );
  }

  const nextCategoryId =
    values.category_id === undefined
      ? currentProduct.category_id
      : Number(values.category_id);
  if (
    values.category_id !== undefined &&
    !(await categoryExists(nextCategoryId))
  ) {
    deleteUploadedFiles(files);
    return res
      .status(400)
      .send(jsend.error({ message: "The selected category does not exist" }));
  }

  const nextProduct = {
    name: values.name === undefined ? currentProduct.name : values.name.trim(),
    description:
      values.description === undefined
        ? currentProduct.description
        : values.description.trim(),
    price:
      values.price === undefined ? currentProduct.price : Number(values.price),
    discount:
      values.discount === undefined
        ? currentProduct.discount
        : Number(values.discount),
    stock:
      values.stock === undefined ? currentProduct.stock : Number(values.stock),
    size: values.size === undefined ? currentProduct.size : values.size.trim(),
    category_id: nextCategoryId,
  };

  try {
    await db.promise().execute(
      `UPDATE products
       SET name = ?, description = ?, price = ?, discount = ?, stock = ?, size = ?, category_id = ?
       WHERE id = ?`,
      [
        nextProduct.name,
        nextProduct.description,
        nextProduct.price,
        nextProduct.discount,
        nextProduct.stock,
        nextProduct.size,
        nextProduct.category_id,
        productId,
      ],
    );

    const images =
      files.length > 0
        ? await insertProductImages(productId, files)
        : await getProductImages([productId]);
    return res.status(200).send(
      jsend.success({
        message: "Product updated successfully",
        product: {
          id: productId,
          ...nextProduct,
          images,
        },
      }),
    );
  } catch (error) {
    deleteUploadedFiles(files);
    throw error;
  }
});

const deleteProduct = AsyncWrapper(async (req, res) => {
  const productId = parseProductId(req.params.id);
  if (!productId) {
    return res.status(400).send(jsend.error({ message: "Invalid product ID" }));
  }

  const images = await getProductImages([productId]);
  const [result] = await db
    .promise()
    .execute("DELETE FROM products WHERE id = ?", [productId]);
  if (result.affectedRows === 0) {
    return res.status(404).send(jsend.error({ message: "Product not found" }));
  }

  deleteUploadedFiles(
    images
      .map((image) => path.basename(image.imageurl))
      .map((filename) => ({ filename })),
  );
  return res
    .status(200)
    .send(jsend.success({ message: "Product deleted successfully" }));
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
