const express = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth');
const Bookings = require('../../models/Bookings');
const { default: mongoose } = require('mongoose');
const router = express.Router();

// @route  api/inquiry/userId
// @desc   Get all concerned Inquiries
// @method GET
// @access  private

router.get('/:userId', auth, async (req, res) => {
    try {
        const inquiries = await Bookings.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.params.userId),
                    confirmed: 0
                }
            },
            {
                $lookup:
                {
                    from: 'properties',
                    localField: 'venue',
                    foreignField: '_id',
                    as: 'venueDetail'
                },
            }
        ])

        res.json(inquiries);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})

// @route    POST api/inquiry
// @desc    insert Inquiry from website
// @access  private

router.post('/', [
    check('personName', 'Person Name is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('contactNo', 'contact No is required').not().isEmpty(),
    check('eventDate', 'eventDate is required').not().isEmpty(),
    check('bookingDate', 'bookingDate is required').not().isEmpty(),
    check('venue', 'venue is required').not().isEmpty(),
    check('partition', 'partition is required').not().isEmpty(),
    check('noOfGuest', 'noOfGuest is required').not().isEmpty(),
    check('bookingDescription', 'Description is required').not().isEmpty(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { personName, email, contactNo, eventDate, bookingDate, venue, partition, noOfGuest, bookingDescription } = req.body;

    try {
        // encrypt password
        const inquiry = new Bookings({
            personName,
            email,
            contactNo,
            eventDate,
            bookingDate,
            venue,
            partition,
            noOfGuest,
            bookingDescription,
            confirmed: 0
        });


        await inquiry.save();

        // return jsonwebtoken

        res.json({
            status: true
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }

});

module.exports = router;