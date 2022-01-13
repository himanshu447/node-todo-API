const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error('Invalid Email');
            }
        },
    },
    age: {
        type: Number,
        default: 20,
        validate(val) {
            if (val < 18 && val > 55) {
                throw new Error('Age must be in between of 18 and 55');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    avatar: {
        type: Buffer,
    },
    tokens: [{
        token: {
            type: String,
        }
    }],
}, {
    timestamps: true,
});

//we are using normal function() rather then callable function bez function() have access of current user data

//directly call by express 
//this is override method if not define then it will return all fields 
userSchema.methods.toJSON = function () {
    //this refer as current user object
    const user = this;

    //create new object from exist object
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

//directly access method through object 
userSchema.methods.createToken = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

//directly access method through class or model name
userSchema.statics.findUserByCredential = async (email, password) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    const hasMatch = await bcrypt.compare(password, user.password);

    if (!hasMatch) {
        throw new Error('Password incorrect');
    }
    return user;
}

userSchema.virtual('myTodo',{
    ref : 'Todo',
    localField : '_id',
    foreignField : 'owner',
});


//Hash the plain text password before saving 
//(MiddleWare of mongoose that run before save the data) 
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});


// Create mongoose model with 'User' name
const User = mongoose.model('User', userSchema);

module.exports = User;