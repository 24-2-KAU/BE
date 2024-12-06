const user = require('../models/userAdvertiser');

exports.registerUser = async (req, res) => {
  try {
      const { username, email, password } = req.body;

      // Check if the user already exists
      const existingUser = await User.findUserByEmail(email);
      if (existingUser) {
          return res.status(400).json({ message: 'Email already exists' });
      }

      // Create a new user
      const userId = await User.createUser(username, email, password);
      res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;

      // Verify credentials
      const user = await User.verifyCredentials(email, password);
      if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};