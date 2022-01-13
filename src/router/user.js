const express = require('express');
const User = require('../models/user');
const authTokenVerification = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = express.Router();

router.post('/user/create', async (req, res) => {

    try {
        const user = User(req.body);
        await user.save();
        const token = await user.createToken();
        res.send({
            user,
            token,
        });
    } catch (e) {
        res.status(400).send(e.toString());
    }
}, (error, req, res, next) => {
    res.send(error);
});

router.post('/user/login', async (req, res) => {

    try {
        const user = await User.findUserByCredential(req.body.email, req.body.password);
        const token = await user.createToken();
        res.send({
            user,
            token,
        });
    } catch (e) {
        console.log(e);
        res.status(400).send(e.toString());
    }
});

router.post('/user/logout', authTokenVerification, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(401).send(e.toString());
    }
});

router.post('/user/allDeviceLogout', authTokenVerification, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(401).send(e.toString());
    }
})

router.get('/user/me', authTokenVerification, async (req, res) => {

    try {
        res.send(req.user);
    } catch (e) {
        res.status(401).send(e);
    }
});

router.get('/user/all', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (e) {
        res.status(401).send(e.toString());
    }
});

router.patch('/user/update', authTokenVerification, async (req, res) => {
    try {
        const updatedFields = ['name', 'password', 'age'];
        const userTryToUpdateFields = Object.keys(req.body);

        const isUpdate = userTryToUpdateFields.every((data) => updatedFields.includes(data));

        console.log(isUpdate);

        if (!isUpdate) {
            res.status(500).send('You are not able to update all fields')
        }

        userTryToUpdateFields.forEach((el) => req.user[el] = req.body[el]);
        await req.user.save();
        res.send(req.user);

    } catch (e) {
        res.status(400).send(e.toString());
    }
});

router.delete('/user/delete', authTokenVerification, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e.toString());
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg||jpeg||png)$/)) {
            return cb(new Error('File must be Image'));
        }
        cb(undefined, true);
    }
});

router.post('/user/upload/avatar', authTokenVerification, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer)
        .resize(250, 250)
        .png()
        .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send(req.user);
});

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            res.status(401).send('User Not Found');
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(401).send(e.toString());
    }
})

module.exports = router;