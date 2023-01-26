const express = require('express');

const upload = require("../../middleware/multer");
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('../../config/event-booking-applicatio-ee04e-firebase-adminsdk-3jo3s-cd699b381a.json')
const admin = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
});
const auth = require('../../middleware/auth');
const storageRef = admin.storage().bucket(`gs://event-booking-applicatio-ee04e.appspot.com`);
const router = express.Router();

router.post("/", [auth, upload.single("filepond")], async (req, res) => {
    try {
        const timeStamp = Date.now();
        const storage = await storageRef.upload(req.file.path, {
            public: true,
            destination: `assignments/${timeStamp}-${req.file.originalname}`
        });
        // console.log(storage[0].metadata.mediaLink)
        // res.send(`${timeStamp}-${req.file.originalname}`);
        res.send(storage[0].metadata.mediaLink);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
});

router.delete('/', async (req, res) => {
    try {
        const storage = await storageRef.file("assignments/" + req.query.fileName).delete();

        res.json(true);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] })
    }
})

module.exports = router;

