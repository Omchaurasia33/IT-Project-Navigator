const Tenant = require('../models/Tenant');

/**
 * @description Get all tenants
 * @route GET /tenants
 * @access Public
 */
exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().select('name slug').sort({ name: 1 });
    res.json(tenants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
