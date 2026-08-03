const {
    getAllUsers,
    createUser
} = require('../services/userService');

const getUsers = (req, res) => {
    res.json(getAllUsers());
};

const addUser = (req, res) => {
    const user = createUser(req.body);

    res.status(201).json(user);
};

module.exports = {
    getUsers,
    addUser
};