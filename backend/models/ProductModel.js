const { default: mongoose } = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: Array,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    sizes: {
      type: Array,
      required: true
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;
