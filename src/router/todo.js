const express = require('express');
const authTokenVerification = require('../middleware/auth');
const Todo = require('../models/todo');
const multer = require('multer');
const sharp = require('sharp');

const router = express.Router();

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg||png)/)) {
            return cb('Image must be jpg or png', false);
        }
        cb(undefined, true);
    }
});

router.post('/todo/create', authTokenVerification, upload.single('image'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer)
            .resize(250, 250)
            .png()
            .toBuffer();

        const todo = Todo({
            ...req.body,
            owner: req.user._id,
            //image: buffer,
        });
        await todo.save();
        res.send(todo);
    } catch (e) {
        res.status(401).send(e.toString());
    }
});

router.get('/todo/fetchAllUserTodo', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.send(todos);
    } catch (e) {
        res.status(400).send(e.toString());
    }
});

router.get('/todo/fetchTodo', authTokenVerification, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if (req.query.completed) {
            match.completed = req.query.completed === 'true';
        }

        if (req.query.sortBy) {
            const path = req.query.sortBy.split(':');
            sort[path[0]] = path[1] === 'asc' ? 1 : -1;
        }
        await req.user.populate({
            path: 'myTodo',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        });
        res.send(req.user.myTodo);
    } catch (e) {
        res.status(401).send(e.toString());
    }
});

router.delete('/todo/deleteAll', authTokenVerification, async (req, res) => {
    try {
        const todo = await Todo.deleteMany({ owner: req.user._id });
        res.send(todo);
    } catch (e) {
        res.status(401).send(e.toString());
    }
});

router.delete('/todo/delete/:id', authTokenVerification, async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete({_id : req.params.id , owner : req.user._id});
        res.send(todo);
    } catch (e) {
        res.status(401).send(e.toString());
    }
});

router.patch('/todo/update/:id', authTokenVerification, async (req, res) => {
    try {
        const updatedFields = ['title', 'body', 'completed'];
        const userTryToUpdates = Object.keys(req.body);

        const isValidUpdate = userTryToUpdates.every((el) => updatedFields.includes(el));

        if (!isValidUpdate) {
            return res.status(400).send('Invalid Field to update');
        }

        //const todo = await Todo.findByIdAndUpdate({_id : req.params.id}, { $set: req.body }, { new: true, runValidators: true });
        const todo = await Todo.findOne({ _id: req.params.id, owner: req.user._id });

        if (!todo) {
            return res.status(400).send('Data not found');
        }
        userTryToUpdates.forEach((e) => todo[e] = req.body[e]);
       
        await todo.save();
        res.send(todo);
    } catch (e) {
        res.status(401).send(e.toString());
    }
});

module.exports = router;