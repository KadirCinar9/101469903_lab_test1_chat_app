const express = require('express');
const router = express.Router();
const GroupMessage = require('../models/GroupMessage');
const PrivateMessage = require('../models/PrivateMessage');

// @route   POST api/messages/group
// @desc    Save a group message
// @access  Public
router.post('/group', async (req, res) => {
    try {
        const { from_user, room, message } = req.body;

        const newMessage = new GroupMessage({
            from_user,
            room,
            message
        });

        const savedMessage = await newMessage.save();
        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/group/:room
// @desc    Get messages for a specific room
// @access  Public
router.get('/group/:room', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room })
            .sort({ date_sent: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/messages/private
// @desc    Save a private message
// @access  Public
router.post('/private', async (req, res) => {
    try {
        const { from_user, to_user, message } = req.body;

        const newMessage = new PrivateMessage({
            from_user,
            to_user,
            message
        });

        const savedMessage = await newMessage.save();
        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/messages/private/:userId
// @desc    Get private messages for a user
// @access  Public
router.get('/private/:userId', async (req, res) => {
    try {
        const messages = await PrivateMessage.find({
            $or: [
                { from_user: req.params.userId },
                { to_user: req.params.userId }
            ]
        }).sort({ date_sent: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 