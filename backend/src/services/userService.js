const users = [
    {
        id: 1,
        name: "Dhivya",
        email: "dhivya@gmail.com"
    }
];

const getAllUsers = () => {
    return users;
};

const createUser = (userData) => {
    const newUser = {
        id: users.length + 1,
        ...userData
    };

    users.push(newUser);

    return newUser;
};

module.exports = {
    getAllUsers,
    createUser
};