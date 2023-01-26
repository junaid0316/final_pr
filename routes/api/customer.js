const express = require('express');
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const Customers = require('../../models/Customers');

// visitors

// @route   POST api/customer/register
// @desc    
// @access  Public
router.post('/register',  [
    check('user_email', 'Email is required').not().isEmpty(),
    check('phone_number', 'Phone Number is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_email, phone_number, password } = req.body;

    try {
        // check if user exist
        let customer = await Customers.findOne({ user_email });
        if (customer) {
            return res.status(400).json({ errors: [{ msg: 'User already exist' }] })
        }

        // encrypt password
        customer = new Customers({
            user_email,
            phone_number,
            password
        });

        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(password, salt);

        await customer.save();

        // return jsonwebtoken
        const payload = {
            customer: {
                id: customer.id
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





module.exports = router;