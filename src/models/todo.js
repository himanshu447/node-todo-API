const mongoose = require('mongoose');

const todoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    body: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    image: {
        type: Buffer,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
});

todoSchema.methods.toJSON = function () {
    const todo = this;
    const todoObject = todo.toObject();
    
    delete todoObject.image;

    return todoObject;
}
todoSchema.pre('save', function (next) {
    console.log('Todo Save call');
    next();
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;