const jsend = require("jsend");
const AsyncWrapper = require("../middleware/Wrapper");
const { db } = require("../config/ConnectDB");

const parsePositiveInteger = (value, fallback, maximum) => {
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
  return Number.isSafeInteger(productId) && productId > 0
    ? productId
    : null;
};

const getReviewById = async (reviewId, productId) => {
  const productFilter = productId === undefined ? "" : "AND product_id = ?";
  const params =
    productId === undefined ? [reviewId] : [reviewId, productId];
  const [reviews] = await db.promise().execute(
    `SELECT id, product_id, user_id, rating, comment
     FROM product_reviews
     WHERE id = ? ${productFilter}`,
    params,
  );
  return reviews[0];
};

const getReviewProfileQuery = `
  SELECT product_reviews.id, product_reviews.product_id,
         product_reviews.user_id,
         COALESCE(users.name, product_reviews.reviewer_name) AS reviewer_name,
         users.email, users.image, product_reviews.rating, product_reviews.comment,
         product_reviews.created_At AS created_at,
         products.name AS product_name
  FROM product_reviews
  LEFT JOIN users ON product_reviews.user_id = users.id
  INNER JOIN products ON product_reviews.product_id = products.id
`;

const getProductReviews = AsyncWrapper(async (req, res) => {
  const productId = parseProductId(req.params.id);
  if (!productId) {
    return res.status(400).send(jsend.error({ message: "Invalid product ID" }));
  }

  const requestedPage = parsePositiveInteger(req.query.page, 1, Number.MAX_SAFE_INTEGER);
  const limit = parsePositiveInteger(req.query.limit, 20, 50);
  const [products] = await db
    .promise()
    .execute("SELECT id FROM products WHERE id = ?", [productId]);

  if (products.length === 0) {
    return res.status(404).send(jsend.error({ message: "Product not found" }));
  }

  const [[summary]] = await db.promise().execute(
    `SELECT COUNT(*) AS totalReviews, COALESCE(AVG(rating), 0) AS averageRating
     FROM product_reviews WHERE product_id = ?`,
    [productId],
  );
  const totalReviews = Number(summary.totalReviews);
  const totalPages = Math.ceil(totalReviews / limit);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const offset = (page - 1) * limit;
  const [reviews] = await db.promise().execute(
    `SELECT product_reviews.id,
            COALESCE(users.name, product_reviews.reviewer_name) AS reviewer_name,
            users.email,
            users.image,
            users.id AS user_id,
            product_reviews.rating,
            product_reviews.comment,
            product_reviews.created_At AS created_at
     FROM product_reviews
     LEFT JOIN users ON product_reviews.user_id = users.id
     WHERE product_reviews.product_id = ?
     ORDER BY product_reviews.created_At DESC, product_reviews.id DESC
     LIMIT ? OFFSET ?`,
    [productId, limit, offset],
  );

  return res.status(200).send(
    jsend.success({
      reviews,
      summary: {
        totalReviews,
        averageRating: Number(summary.averageRating),
      },
      pagination: { page, limit, totalReviews, totalPages },
    }),
  );
});

const getAllProductReviews = AsyncWrapper(async (req, res) => {
  const requestedPage = parsePositiveInteger(
    req.query.page,
    1,
    Number.MAX_SAFE_INTEGER,
  );
  const limit = parsePositiveInteger(req.query.limit, 20, 100);
  const [[summary]] = await db
    .promise()
    .execute("SELECT COUNT(*) AS totalReviews FROM product_reviews");
  const totalReviews = Number(summary.totalReviews);
  const totalPages = Math.ceil(totalReviews / limit);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const offset = (page - 1) * limit;
  const [reviews] = await db.promise().execute(
    `${getReviewProfileQuery}
     ORDER BY product_reviews.created_At DESC, product_reviews.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  return res.status(200).send(
    jsend.success({
      reviews,
      pagination: { page, limit, totalReviews, totalPages },
    }),
  );
});

const createProductReview = AsyncWrapper(async (req, res) => {
  const productId = parseProductId(req.params.id);
  if (!productId) {
    return res.status(400).send(jsend.error({ message: "Invalid product ID" }));
  }

  const userId = Number(req.user?.userId);
  const comment =
    typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
  const rating = Number(req.body?.rating);
  const errors = [];

  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(401).send(jsend.error({ message: "Invalid user token" }));
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push("rating must be an integer between 1 and 5");
  }
  if (comment.length < 10 || comment.length > 2000) {
    errors.push("comment must be between 10 and 2000 characters");
  }
  if (errors.length > 0) {
    return res
      .status(400)
      .send(jsend.error({ message: "Invalid review data", errors }));
  }

  const [products] = await db
    .promise()
    .execute("SELECT id FROM products WHERE id = ?", [productId]);
  if (products.length === 0) {
    return res.status(404).send(jsend.error({ message: "Product not found" }));
  }

  const [users] = await db.promise().execute(
    "SELECT id, name, email, image FROM users WHERE id = ?",
    [userId],
  );
  if (users.length === 0) {
    return res.status(401).send(jsend.error({ message: "User not found" }));
  }
  const user = users[0];

  const [result] = await db.promise().execute(
    `INSERT INTO product_reviews (product_id, user_id, reviewer_name, rating, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [productId, user.id, user.name, rating, comment],
  );
  const [reviews] = await db.promise().execute(
    `SELECT product_reviews.id, users.id AS user_id, users.name AS reviewer_name,
            users.email, users.image, product_reviews.rating,
            product_reviews.comment, product_reviews.created_At AS created_at
     FROM product_reviews
     INNER JOIN users ON product_reviews.user_id = users.id
     WHERE product_reviews.id = ?`,
    [result.insertId],
  );

  return res
    .status(201)
    .send(jsend.success({ review: reviews[0] }));
});

const updateProductReview = AsyncWrapper(async (req, res) => {
  const reviewId = parseProductId(req.params.reviewId ?? req.params.id);
  const productId =
    req.params.reviewId === undefined
      ? undefined
      : parseProductId(req.params.id);
  if (!reviewId || (req.params.reviewId !== undefined && !productId)) {
    return res.status(400).send(jsend.error({ message: "Invalid review ID" }));
  }

  const rating = Number(req.body?.rating);
  const comment =
    typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
  const errors = [];
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push("rating must be an integer between 1 and 5");
  }
  if (comment.length < 10 || comment.length > 2000) {
    errors.push("comment must be between 10 and 2000 characters");
  }
  if (errors.length > 0) {
    return res
      .status(400)
      .send(jsend.error({ message: "Invalid review data", errors }));
  }

  const review = await getReviewById(reviewId, productId);
  if (!review) {
    return res.status(404).send(jsend.error({ message: "Review not found" }));
  }

  const userId = Number(req.user?.userId);
  if (
    req.user?.role !== "admin" &&
    (!Number.isSafeInteger(userId) || userId !== review.user_id)
  ) {
    return res
      .status(403)
      .send(jsend.error({ message: "You can only edit your own review" }));
  }

  await db.promise().execute(
    "UPDATE product_reviews SET rating = ?, comment = ? WHERE id = ?",
    [rating, comment, reviewId],
  );
  const [updatedReviews] = await db.promise().execute(
    `${getReviewProfileQuery} WHERE product_reviews.id = ?`,
    [reviewId],
  );

  return res.status(200).send(
    jsend.success({
      message: "Review updated successfully",
      review: updatedReviews[0],
    }),
  );
});

const deleteProductReview = AsyncWrapper(async (req, res) => {
  const reviewId = parseProductId(req.params.id);
  if (!reviewId) {
    return res.status(400).send(jsend.error({ message: "Invalid review ID" }));
  }

  const [result] = await db
    .promise()
    .execute("DELETE FROM product_reviews WHERE id = ?", [reviewId]);
  if (result.affectedRows === 0) {
    return res.status(404).send(jsend.error({ message: "Review not found" }));
  }

  return res
    .status(200)
    .send(jsend.success({ message: "Review deleted successfully" }));
});

module.exports = {
  getProductReviews,
  createProductReview,
  updateProductReview,
  getAllProductReviews,
  deleteProductReview,
};
