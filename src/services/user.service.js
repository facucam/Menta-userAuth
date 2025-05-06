const UserModel = require("../models/user");

class UserService {

    async createUser(userData) {
        try {
            const user = new UserModel(userData);
            await user.save();
            return user;
        } catch (error) {
            throw new Error(`Error al crear el usuario: ${error.message}`);
        }
    }

    async updateUser(id, userData) {
        try {
            const updatedUser = await UserModel.findOneAndUpdate(
                { 'cuit': id },
                { $set: userData }, // Asegura que solo se actualicen los campos que se pasan en data
                { new: true }
            );
            return updatedUser;
        } catch (error) {
            throw new Error(`Error al actualizar el usuario: ${error.message}`);
        }
    }

    async deleteUser(userId) {
        try {
            const user = await UserModel.deleteOne({'cuit': userId});
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error(`Error al eliminar el usuario: ${error.message}`);
        }
    }

    async findUserById(id) {
        try {
            const user = await UserModel.findOne({'cuit': id});
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        } catch (error) {
            throw new Error(`Error al buscar el usuario: ${error.message}`);
        }
    }
}

module.exports = new UserService();
