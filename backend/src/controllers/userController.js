const User = require('../models/User');

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json({ items: users });
  } catch (err) {
    return next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!User.ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listUsers,
  updateUserRole,
};

