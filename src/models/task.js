const mongoose = require('mongoose')
const validator = require('validator')

// Creating a Task Schema
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // Referencing User model
        ref: 'User'
    }
}, {
    timestamps: true
})

// Creating a Task model
const Task = mongoose.model('Task', taskSchema)

module.exports = Task
