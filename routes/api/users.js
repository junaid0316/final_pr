const express = require('express');
const { check, validationResult } = require('express-validator')
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const auth = require('../../middleware/auth');

// @route   POST api/users
// @desc    User Registration
// @access  Public

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please provide a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {

        // check if user exist
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exist' }] })
        }

        // get user gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        // encrypt password
        user = new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token })
            })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }

});

// @route   POST api/users/id
// @desc    Update Info
// @access  Public
router.put('/:id', [auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('contact', 'contact is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('avatar', 'Avatar is required').not().isEmpty(),
]], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, contact, address, avatar } = req.body;

    try {
        const filter = { _id: mongoose.Types.ObjectId(req.params.id) };
        const options = { new: true };
        const updateDoc = {
            name,
            contact,
            address,
            avatar
        }
        const user = await User.updateOne(filter, updateDoc, options);
        if (user) {
            res.json(user);
        }


    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }

});





module.exports = router;