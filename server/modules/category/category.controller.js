const mongoose = require("mongoose");
const categoryService = require("./category.service");

const getCategories = async (req, res) => {
	try {
		const categories = await categoryService.getCategories();

		res.status(200).json({
			message: "Categories fetched successfully",
			data: categories,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getCategoryById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid category id" });
		}

		const category = await categoryService.getCategoryById(id);

		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		res.status(200).json({
			message: "Category fetched successfully",
			data: category,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;

		const category = await categoryService.createCategory({ name, description });

		res.status(201).json({
			message: "Category created successfully",
			data: category,
		});
	} catch (error) {
		res.status(error.status || 500).json({ message: error.message });
	}
};

const updateCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description } = req.body;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid category id" });
		}

		const category = await categoryService.updateCategory(id, { name, description });

		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		res.status(200).json({
			message: "Category updated successfully",
			data: category,
		});
	} catch (error) {
		res.status(error.status || 500).json({ message: error.message });
	}
};

const deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid category id" });
		}

		const category = await categoryService.deleteCategory(id);

		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		res.status(200).json({
			message: "Category deleted successfully",
			data: category,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getCategories,
	getCategoryById,
	createCategory,
	updateCategory,
	deleteCategory,
};
