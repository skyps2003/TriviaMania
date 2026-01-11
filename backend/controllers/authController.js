const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;

        // Validations
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Por favor ingrese todos los campos' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
            avatar: avatar || 'robot_1'
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email, points: user.points, avatar: user.avatar } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Por favor ingrese todos los campos' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email, points: user.points, gamesPlayed: user.gamesPlayed, avatar: user.avatar } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { userId, avatar, username, password } = req.body;

        let updateFields = {};
        if (avatar) updateFields.avatar = avatar;
        if (username) updateFields.username = username;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'El nombre de usuario o email ya está en uso' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
