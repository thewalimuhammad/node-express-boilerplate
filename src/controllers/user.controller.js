const { userModel } = require('../models');
const { Role } = require('../constant/index');

const getUsers = async (req, res) => {
  try {
    const userExists = await userModel.findById(req.user.id);
    if (userExists.role !== Role.SUPER_ADMIN) {
      return res.status(401).send({
        message: 'Unauthorized access',
      });
    }
    let { page = 1, limit = 10, search = '', role = '' } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    const query = {
      ...(search && { name: { $regex: search, $options: 'i' } }),
      ...(role && { role: role }),
    };

    const users = await userModel
      .find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await userModel.countDocuments(query);

    return res.status(200).send({
      message: 'All Users details',
      data: {
        totalUser: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        perPage: limit,
        users: users,
      },
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (user.role !== Role.SUPER_ADMIN) {
      return res.status(401).send({
        message: 'Unauthorized access',
      });
    }
    const userExists = await userModel
      .findById(req.params.id)
      .select('-password');
    return res.status(200).send({
      message: 'User details',
      data: userExists,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const updateUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (user.role !== Role.SUPER_ADMIN) {
      return res.status(401).send({
        message: 'Unauthorized access',
      });
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );
    return res.status(200).send({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const query = { _id: req.params.id, isDeleted: false };
    const user = await userModel.findOne(query);
    if (!user) {
      return res.status(404).send({
        message: 'User not found',
      });
    }
    if (user.role !== Role.SUPER_ADMIN) {
      return res.status(401).send({
        message: 'Unauthorized access',
      });
    }
    await userModel.findByIdAndUpdate(req.params.id, { isDeleted: true });
    return res.status(200).send({
      message: 'User deleted successfully',
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
};
module.exports = {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
