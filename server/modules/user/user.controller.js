const userService = require('./user.service');
const { createUserSchema, updateUserSchema } = require('./user.validation');

module.exports = {
    // POST /users  (admin only)
    create: async (req, res) => {
        try {
            const { error } = createUserSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });

            const newUser = await userService.CreateAnUser(req.body);
            const result = newUser.toObject();
            delete result.password;
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ success: false, message: 'Email already exists' });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /user
    getAll: async (req, res) => {
        try {
            const users = await userService.GetAllUser();
            res.status(200).json({ success: true, data: users });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /user/:id
    getById: async (req, res) => {
        try {
            const user = await userService.GetUserById(req.params.id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // PUT /user/:id
    update: async (req, res) => {
        try {
            const { error } = updateUserSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });
            
            const updatedUser = await userService.UpdateUser(req.params.id, req.body);
            if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
            res.status(200).json({ success: true, data: updatedUser });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // DELETE /user/:id
    delete: async (req, res) => {
        try {
            const result = await userService.DeleteUser(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'User not found' });
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // PUT /user/profile
    updateProfile: async (req, res) => {
        try {
            const { error } = updateUserSchema.validate(req.body);
            if (error) return res.status(400).json({ success: false, message: error.details[0].message });
            
            // req.user is set by verifyToken middleware (using req.user.id)
            const updatedUser = await userService.UpdateUser(req.user.id, req.body);
            if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
            
            // Return updated user object without password
            const result = updatedUser.toObject();
            delete result.password;
            res.status(200).json({ success: true, data: result, token: req.headers.authorization.split(' ')[1] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
