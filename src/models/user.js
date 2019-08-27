const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

// Creating a User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error ('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if (value.toLowerCase().includes('password')) {
                throw new Error ('Password cannot contain the word "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0){
                throw new Error('Age must be positive')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// Creating Middleware for userSchema
//===================================

// Creating virtual attributes
userSchema.virtual('tasks', {
    //Referencing Task model
    ref: 'Task',
    //Specify local field (field in User model)
    localField: '_id',
    //Specify foreign field (field in Task model)
    foreignField: 'owner'
})

// Creating a customize instance method to hide password, token and avatar
userSchema.methods.toJSON = function () {
    const user = this

    //Mongoose returns object with extra metadata. To get object just like in DB, we have to use toObject method
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// Creating a customize instance method to generate jwt token
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    // user.tokens = user.tokens.concat({ token })
    user.tokens.push({ token })
    await user.save()

    return token
}

// Creating a customize model method to authenticate user
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    //If no such user exist
    if (!user) {
        throw new Error ('Unable to login')
    }

    //Comparing password
    const isMatch =  await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error ('Unable to login')
    }

    return user
}

// Hash the password before saving
userSchema.pre('save', async function(next) {

    //this refer to user that is about to be saved. Defining variable for easy understand
    const user = this

    //code to be executed before saving
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    //next is called to indicate the end of excuting function (accounts for async functions)
    next()
})

// Deleted user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

// Creating a User model
const User = mongoose.model('User', userSchema)

module.exports = User