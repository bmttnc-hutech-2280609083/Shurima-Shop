const Brand = require('./brand.model');

const normalizeName = (value) => value.trim().replace(/\s+/g, " ");

const getBrands = async () => {
	return Brand.find().sort({ createdAt: -1 });
};

const getBrandById = async (id) => {
	return Brand.findById(id);
};

const createBrand = async (name) => {
	const normalizedName = normalizeName(name);

	const existing = await Brand.findOne({
		name: { $regex: `^${normalizedName}$`, $options: "i" },
	});

	if (existing) {
		const error = new Error("Brand already exists");
		error.status = 409;
		throw error;
	}

	return Brand.create({ name: normalizedName });
};

const updateBrand = async (id, name) => {
	const normalizedName = normalizeName(name);

	const existing = await Brand.findOne({
		_id: { $ne: id },
		name: { $regex: `^${normalizedName}$`, $options: "i" },
	});

	if (existing) {
		const error = new Error("Brand already exists");
		error.status = 409;
		throw error;
	}

	return Brand.findByIdAndUpdate(
		id,
		{ name: normalizedName },
		{ new: true, runValidators: true }
	);
};

const deleteBrand = async (id) => {
	return Brand.findByIdAndDelete(id);
};

module.exports = {
	getBrands,
	getBrandById,
	createBrand,
	updateBrand,
	deleteBrand,
};
