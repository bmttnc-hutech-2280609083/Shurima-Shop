const express = require("express");

const router = express.Router();

const {
	getCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
} = require("./category.controller");

const { validateCategoryBody } = require("./category.validation");

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", validateCategoryBody, createCategory);
router.put("/:id", validateCategoryBody, updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
