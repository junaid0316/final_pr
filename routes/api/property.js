const express = require('express');
const { check, validationResult } = require('express-validator')
const Property = require('../../models/Property');
const Package = require('../../models/Package');
const auth = require('../../middleware/auth');
const { default: mongoose } = require('mongoose');
const router = express.Router();

// @route    api/property
// @desc    Property Registration
// @access  private

router.post('/', [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('userId', 'User is not defined').not().isEmpty(),
    check('packages'),
    check('partition', 'Atleast One Partition is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('gallery', 'Gallery is required').not().isEmpty(),
    check('geometery', 'Geometery is required').not().isEmpty(),
    check('type', 'Type is required').not().isEmpty()
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { city, packages, partition, description, gallery, title, type, userId, geometery } = req.body;

    try {
        // encrypt password
        const property = new Property({
            city,
            packages,
            partition,
            description,
            gallery,
            title,
            type,
            geometery,
            userId,
            itemPriority: 0
        });


        await property.save();

        // return jsonwebtoken

        res.json({
            property: {
                id: property.id
            }
        })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }

});
// @route    api/property
// @desc    Update Property Registration
// @access  private

router.put('/:id', [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('userId', 'User is not defined').not().isEmpty(),
    check('packages'),
    check('partition', 'Atleast One Partition is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('gallery', 'Gallery is required').not().isEmpty(),
    check('type', 'Type is required').not().isEmpty()
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { address, city, packages, partition, description, gallery, title, type, userId } = req.body;
    let packagesObj = packages.map(i => mongoose.Types.ObjectId(i))
    try {
        const filter = { _id: mongoose.Types.ObjectId(req.params.id) };
        const options = { new: true };
        const updateDoc = {
            address,
            city,
            'packages': packagesObj,
            partition,
            description,
            gallery,
            title,
            type,
            userId
        }
        const property = await Property.updateOne(filter, updateDoc, options);
        res.json(property);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })

    }



});

// @route  api/property/id
// @desc   Get all listing properties
// @method GET
// @access  private

router.get('/:userid', auth, async (req, res) => {
    try {
        // const property = await Property.find({
        //     userId: mongoose.Types.ObjectId(req.params.userid),
        //     activeStatus: true
        // })

        const property = await Property.aggregate([

            {
                $match: {
                    activeStatus: true,
                    userId: mongoose.Types.ObjectId(req.params.userid),
                }
            },
            {
                $lookup:
                {
                    from: 'packages',
                    localField: 'packages',
                    foreignField: '_id',
                    as: 'packageDetails'
                },
            },
            {
                $sort: {
                    date: -1
                }
            }
        ])
        res.json(property);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})
// @route  api/property/get
// @desc   Get shortlisted properties
// @method GET
// @access  private

router.get('/', async (req, res) => {
    try {
        // const property = await Property.find({
        //     activeStatus: true
        // }).sort({ date: -1 })
        const property = await Property.aggregate([

            {
                $match: {
                    activeStatus: true
                }
            },
            {
                $lookup:
                {
                    from: 'packages',
                    localField: 'packages',
                    foreignField: '_id',
                    as: 'packageDetails'
                },
            },
            {
                $sort: {
                    date: -1
                }
            }
        ])

        res.json(property);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})

// @route  api/property/id
// @desc   Get all listing properties
// @method GET
// @access  private
router.get('/single-property/:service_id', async (req, res) => {
    try {
        const property = await Property.aggregate([

            {
                $match: {
                    activeStatus: true,
                    _id: mongoose.Types.ObjectId(req.params.service_id)
                }
            },
            {
                $lookup:
                {
                    from: 'packages',
                    localField: 'packages',
                    foreignField: '_id',
                    as: 'packageDetails'
                },
            },
            {
                $sort: {
                    date: -1
                }
            }
        ])


        // const property = await Property.findById(req.params.service_id);
        res.json(property.find(x => x._id == req.params.service_id));
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})


// @route  api/property/add-package
// @desc   Post Package Data
// @method Post
// @access  private

router.post('/add-package', [
    auth,
    check('package_name', 'package is required').not().isEmpty(),
    check('userId', 'User is not defined').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { package_name, userId } = req.body;

    try {
        package = new Package({
            package_name,
            userId
        });


        await package.save();

        // return jsonwebtoken

        res.json({
            package: {
                id: package.id
            }
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

// @route  api/property/packages
// @desc   Get Package Data
// @method GET
// @access  private

router.get('/packages/:userid', auth, async (req, res) => {
    try {
        const package = await Package.find({
            userId: mongoose.Types.ObjectId(req.params.userid)
        })
        res.json(package);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})
// @route  api/property/venue-packages
// @desc   Get selected property package Data
// @method GET
// @access  private

router.get('/venue-packages/:propertyId', auth, async (req, res) => {
    try {
        // const package = await Package.find({
        //     userId: mongoose.Types.ObjectId(req.params.userid)
        // })
        // res.json(package);

        const propertyPackages = await Property.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.propertyId)
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
            },
            {
                $project: { _id: 1, packages: 1 }
            }


        ])
        res.json(propertyPackages);


    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})

// @route  api/property/deactivate-servive
// @desc   deactive service
// @method POST
// @access  private

router.get('/deactivate-servive/:service_id', auth, async (req, res) => {
    try {
        const filter = { _id: mongoose.Types.ObjectId(req.params.service_id) };
        const options = { new: true };
        const updateDoc = {
            activeStatus: false
        }
        const property = await Property.updateOne(filter, updateDoc, options);
        res.json(property);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})

// @route  api/property/activate-servive
// @desc   activate service
// @method POST
// @access  private

router.get('/activate-servive/:service_id', auth, async (req, res) => {
    try {
        const filter = { _id: mongoose.Types.ObjectId(req.params.service_id) };
        const options = { new: true };
        const updateDoc = {
            activeStatus: true
        }
        const property = await Property.updateOne(filter, updateDoc, options);
        res.json(property);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }

})


module.exports = router;