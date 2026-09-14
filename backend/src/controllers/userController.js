const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
  createUser,
  findUserByEmail
} = require('../services/userService');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser =
      await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const user = await createUser(
      name,
      email,
      password
    );

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server Error'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('LOGIN REQUEST:', email);

    const user =
      await findUserByEmail(email);
    console.log('USER FOUND:', user);

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }
    
    console.log('CHECKING PASSWORD');
    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }
    
    console.log('CREATING TOKEN');
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    res.json({
      token
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    res.status(500).json({
      message: 'Server Error'
    });
  }
};

module.exports = {
  signup,
  login
};