const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {
    try {
        userId = null;
        res.status(200).json({ logOutStatus: true  })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

