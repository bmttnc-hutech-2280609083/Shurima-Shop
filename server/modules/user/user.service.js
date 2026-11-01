const User = require('./user.model');
const bcrypt = require('bcryptjs');

module.exports = {
    CreateAnUser: async function (userData, session) {
        const { name, email, password, phone, address, role } = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let newUser = new User({ name, email, password: hashedPassword, phone, address, role: role || 'user' });
        if (session) return await newUser.save({ session });
        return await newUser.save();
    },
    GetAllUser: async function () {
        return await User.find().select('-password');
    },
    GetUserById: async function (id) {
        return await User.findById(id).select('-password');
    },
    UpdateUser: async function (id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    },
    DeleteUser: async function (id) {
        return await User.findByIdAndDelete(id);
    }
};
