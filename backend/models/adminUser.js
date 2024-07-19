const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  password: { type: String ,required: true},
  userType: { type: String ,required: true},
});

const AdminUser = mongoose.model('adminUser', adminUserSchema);

module.exports = AdminUser;
