const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    cuit: String,        
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,          
    lastName: String,     
    email: { type: String, required: true, unique: true },
    is_admin: { type: Boolean, default: false },
    birth_date: { type: Date }, // Patient

    // NUEVO:
    user_type: {
        type: String,
        enum: ['patient', 'therapist'],
        required: true
    },

    // Datos adicionales por tipo:
    specialties: { type: [String], default: [] }, // Therapist
    license_number: { type: String }, // Therapist
    medical_history: { type: String }, // Patient

});

module.exports = mongoose.model('User', UserSchema);