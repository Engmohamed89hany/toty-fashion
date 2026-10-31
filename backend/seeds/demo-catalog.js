const { db } = require("../config/ConnectDB");

const categories = [
  {
    title: "ملابس منزلية",
    description: "قطع مريحة وأنيقة للحظاتك الهادئة في المنزل.",
    image:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "لانجيري",
    description: "تصاميم ناعمة بتفاصيل أنثوية وخامات لطيفة.",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "فساتين",
    description: "إطلالات مميزة للمناسبات والأوقات الخاصة.",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "ملابس كاجوال",
    description: "اختيارات يومية تجمع بين الراحة والأناقة.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
];

const products = [
  {
    name: "طقم بيجامة قطن ناعم",
    description: "طقم بيجامة قطني خفيف بقصة مريحة للاستخدام اليومي.",
    price: 890,
    discount: 10,
    stock: 24,
    size: "S, M, L, XL",
    category: "ملابس منزلية",
    image:
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "روب ساتان أنيق",
    description: "روب ساتان ناعم بتصميم بسيط ولمسة أنيقة.",
    price: 1150,
    discount: 0,
    stock: 12,
    size: "S, M, L",
    category: "ملابس منزلية",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f37f4678?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "طقم دانتيل ناعم",
    description: "طقم بتفاصيل دانتيل رقيقة وخامة مريحة.",
    price: 740,
    discount: 15,
    stock: 18,
    size: "S, M, L, XL",
    category: "لانجيري",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "قميص نوم ساتان",
    description: "قميص نوم خفيف بقصة انسيابية ولون هادئ.",
    price: 960,
    discount: 5,
    stock: 9,
    size: "S, M, L",
    category: "لانجيري",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "فستان سهرة كلاسيكي",
    description: "فستان أنيق بقصة كلاسيكية مناسبة للمناسبات.",
    price: 2450,
    discount: 0,
    stock: 7,
    size: "S, M, L",
    category: "فساتين",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "فستان يومي بطبعة زهور",
    description: "فستان خفيف بطبعة زهور لإطلالة يومية مريحة.",
    price: 1380,
    discount: 12,
    stock: 15,
    size: "S, M, L, XL",
    category: "فساتين",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "قميص كاجوال واسع",
    description: "قميص عملي بقصة واسعة يناسب إطلالاتك اليومية.",
    price: 790,
    discount: 0,
    stock: 20,
    size: "S, M, L, XL",
    category: "ملابس كاجوال",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "طقم تونيك وبنطال",
    description: "طقم مريح بتصميم عصري سهل التنسيق.",
    price: 1590,
    discount: 8,
    stock: 11,
    size: "S, M, L, XL",
    category: "ملابس كاجوال",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
];

const seedDemoCatalog = async () => {
  const connection = db.promise();
  const categoryIds = new Map();
  let insertedCategories = 0;
  let insertedProducts = 0;
  let insertedImages = 0;

  try {
    await connection.beginTransaction();

    for (const category of categories) {
      const [existingCategories] = await connection.execute(
        "SELECT id FROM category WHERE title = ? LIMIT 1",
        [category.title],
      );
      let categoryId = existingCategories[0]?.id;

      if (!categoryId) {
        const [result] = await connection.execute(
          "INSERT INTO category (title, decription, image) VALUES (?, ?, ?)",
          [category.title, category.description, category.image],
        );
        categoryId = result.insertId;
        insertedCategories += 1;
      }

      categoryIds.set(category.title, categoryId);
    }

    for (const product of products) {
      const categoryId = categoryIds.get(product.category);
      const [existingProducts] = await connection.execute(
        "SELECT id FROM products WHERE name = ? LIMIT 1",
        [product.name],
      );
      let productId = existingProducts[0]?.id;

      if (!productId) {
        const [result] = await connection.execute(
          `INSERT INTO products
             (name, description, price, discount, stock, size, category_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.description,
            product.price,
            product.discount,
            product.stock,
            product.size,
            categoryId,
          ],
        );
        productId = result.insertId;
        insertedProducts += 1;
      }

      const [existingImages] = await connection.execute(
        "SELECT id FROM product_images WHERE product_id = ? AND imageurl = ? LIMIT 1",
        [productId, product.image],
      );
      if (existingImages.length === 0) {
        await connection.execute(
          "INSERT INTO product_images (product_id, imageurl) VALUES (?, ?)",
          [productId, product.image],
        );
        insertedImages += 1;
      }
    }

    await connection.commit();
    console.log(
      `Demo catalog ready: ${insertedCategories} categories, ${insertedProducts} products, ${insertedImages} images added.`,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
};

seedDemoCatalog().catch((error) => {
  console.error("Could not seed the demo catalog:", error);
  process.exitCode = 1;
});
