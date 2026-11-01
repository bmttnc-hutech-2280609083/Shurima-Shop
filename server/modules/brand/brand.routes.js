const express = require("express");

const router = express.Router();

const {
	getBrands,
	getBrandById,
	createBrand,
	updateBrand,
	deleteBrand,
} = require("./brand.controller");

const { validateBrandBody } = require("./brand.validation");

router.get("/", getBrands);
router.get("/:id", getBrandById);
router.post("/", validateBrandBody, createBrand);
router.put("/:id", validateBrandBody, updateBrand);
router.delete("/:id", deleteBrand);

module.exports = router;
