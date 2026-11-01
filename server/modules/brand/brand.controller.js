const mongoose = require("mongoose");
const brandService = require("./brand.service");

const getBrands = async (req, res) => {
	try {
		const brands = await brandService.getBrands();

		res.status(200).json({
			message: "Brands fetched successfully",
			data: brands,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getBrandById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid brand id" });
		}

		const brand = await brandService.getBrandById(id);

		if (!brand) {
			return res.status(404).json({ message: "Brand not found" });
		}

		res.status(200).json({
			message: "Brand fetched successfully",
			data: brand,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createBrand = async (req, res) => {
	try {
		const { name } = req.body;

		const brand = await brandService.createBrand(name);

		res.status(201).json({
			message: "Brand created successfully",
			data: brand,
		});
	} catch (error) {
		res.status(error.status || 500).json({ message: error.message });
	}
};

const updateBrand = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid brand id" });
		}

		const brand = await brandService.updateBrand(id, name);

		if (!brand) {
			return res.status(404).json({ message: "Brand not found" });
		}

		res.status(200).json({
			message: "Brand updated successfully",
			data: brand,
		});
	} catch (error) {
		res.status(error.status || 500).json({ message: error.message });
	}
};

const deleteBrand = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid brand id" });
		}

		const brand = await brandService.deleteBrand(id);

		if (!brand) {
			return res.status(404).json({ message: "Brand not found" });
		}

		res.status(200).json({
			message: "Brand deleted successfully",
			data: brand,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getBrands,
	getBrandById,
	createBrand,
	updateBrand,
	deleteBrand,
};
