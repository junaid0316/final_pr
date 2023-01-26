const express = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth');
const Bookings = require('../../models/Bookings');
const router = express.Router();
const { default: mongoose } = require('mongoose');
const Property = require('../../models/Property');

// @route    POST api/booking
// @desc    insert booking
// @access  private

router.post('/', [
    auth,
    check('personName', 'Person Name is required').not().isEmpty(),
    check('personCnic', 'CNIC is required').not().isEmpty(),
    check('contactNo', 'contact No is required').not().isEmpty(),
    check('email', 'email is not required').not().isEmpty(),
    check('personAddress', 'Address No 2 is not required').not().isEmpty(),
    check('eventName', 'eventName is required').not().isEmpty(),
    check('eventDate', 'eventDate is required').not().isEmpty(),
    check('bookingDate', 'bookingDate is required').not().isEmpty(),
    check('venue', 'venue is required').not().isEmpty(),
    check('partition', 'partition is required').not().isEmpty(),
    check('noOfGuest', 'noOfGuest is required').not().isEmpty(),
    check('bookingDescription', 'Description is required').not().isEmpty(),
    check('packages'),
    check('bookingRent', 'Booking Rent is required').not().isEmpty(),
    check('bookingDiscount'),
    check('bookingTotal', 'Total is required').not().isEmpty(),
    check('userId', 'userId is required').not().isEmpty(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { personName, personCnic, contactNo, email, personAddress, eventName, eventDate, bookingDate, venue, partition, noOfGuest, bookingDescription, packages, bookingRent, bookingDiscount, bookingTotal, userId } = req.body;

    try {
        // encrypt password
        const booking = new Bookings({
            personName,
            personCnic,
            contactNo,
            email,
            personAddress,
            eventName,
            eventDate,
            bookingDate,
            venue,
            partition,
            noOfGuest,
            bookingDescription,
            packages,
            bookingRent,
            bookingDiscount,
            bookingTotal,
            userId,
            confirmed: 1
        });


        await booking.save();

        // return jsonwebtoken

        res.json({
            status: true
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }

});

// @route  api/booking
// @desc   Get all bookings
// @method GET
// @access  private

router.get('/:userId', auth, async (req, res) => {
    try {
        // const booking = await Bookings.find({
        //     userId: mongoose.Types.ObjectId(req.params.userId)
        // })
        const booking = await Bookings.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.params.userId),
                    confirmed: 1
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

        res.json(booking);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})
// @route  api/booking/specific
// @desc   Get all bookings
// @method GET
// @access  private

router.post('/specific', [
    check('venue_id'),
    check('eventDate'),
    check('partition')

], async (req, res) => {
    const { venue_id, eventDate, partition } = req.body;
    const fromDate = new Date(eventDate)
    const toDate = new Date(eventDate)
    toDate.setHours(28, 59, 59);
    try {
        // const booking = await Bookings.find({
        //     userId: mongoose.Types.ObjectId(req.params.userId)
        // })
        const booking = await Bookings.aggregate([
            {
                $match: {
                    venue: mongoose.Types.ObjectId(venue_id),
                    confirmed: 1,
                    partition: partition,
                    eventDate: { "$gte": fromDate, "$lte": toDate }
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
        let availability = true;
        if (booking.length) {
            availability = false
        }
        res.json({
            availability
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})

// @route  api/booking/check_availability
// @desc   check date is available or not
// @method POST
// @access  Public

router.post('/check_availability', [
    check('propertyId', 'Select Property'),
    check('startDate', 'Select Start Date').not().isEmpty(),
    check('endDate', 'Select End Date').not().isEmpty(),
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { propertyId, startDate, endDate } = req.body;
    const fromDate = new Date(startDate)
    const toDate = new Date(endDate)
    let availability = true;
    toDate.setHours(28, 59, 59);
    let checkAvailability = []

    try {
        const property = await Property.aggregate([
            {
                $match: {
                    // _id: mongoose.Types.ObjectId(req.params.propertyId)
                    activeStatus: true

                }
            },
            {
                $lookup: {
                    'from': 'packages',
                    'let': { 'pid': '$packages' },
                    'pipeline': [
                        { '$match': { '$expr': { '$in': ['$_id', '$$pid'] } } },
                        { '$project': { _id: 1, package_name: 1 } }
                    ],
                    'as': 'packages'
                }
            }
        ])
        if (propertyId) {
            checkAvailability = await Bookings.aggregate([
                {
                    $match: {
                        venue: mongoose.Types.ObjectId(propertyId),
                        eventDate: { "$lt": toDate, "$gte": fromDate }

                    }
                },
                {
                    $project: { venue: 1 }
                }
            ])
        } else {
            checkAvailability = await Bookings.aggregate([
                {
                    $match: {
                        eventDate: { "$lt": toDate, "$gte": fromDate }

                    }
                },
                {
                    $project: { venue: 1 }
                }
            ])
        }
        if (checkAvailability.length) {
            availability = false
        }

        let bookedProperty = checkAvailability.map(x => x.venue.toString())
        let availableProperty = property.filter(x => !bookedProperty.includes(x._id.toString()))
        res.json({
            startDate: fromDate,
            endDate: toDate,
            availability,
            bookedProperty,
            availableProperty
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }

});





module.exports = router;
