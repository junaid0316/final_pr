const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const Customers = require('../../models/Customers');


const router = express.Router();

// @route   GET api/auth
// @desc    Test Route
// @access  Public

router.get('/', auth, async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/auth/customer
// @desc    Test Route
// @access  Public

router.get('/customer', auth, async (req, res) => {
    console.log("hello")
    try {

        const customer = await User.findById(req.user.id).select('-password');
        res.json(customer);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});



// @route   Post api/auth
// @desc    Login User
// @access  Public

router.post('/', [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

        // check if user exist
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
        }

        // return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600*24 },
            (err, token) => {
                if (err) throw err;
                res.json({ token })
            })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }

});


module.exports = router;