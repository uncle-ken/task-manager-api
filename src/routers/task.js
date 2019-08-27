const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//Endpoint to create task
router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        //copy from req.body
        ...req.body,
        //add in owner id
        owner: req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

//Endpoint to Get task list
//GET /tasks?completed=true returns only completed tasks
//GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const part = req.query.sortBy.split('_')
        //If part[1] is 'desc' then sort[part[0]] = -1 else = 1
        sort[part[0]] = part[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                //Descending = -1 and ascending = 1
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send(e)
    }
})

//Endpost to Get single task by id
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try{
        const task = await Task.findOne({ _id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Endpoint to Get single task by id and update it. Will try using PUT instead of PATCH
router.put('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation){
        return res.status(400).send({ error: 'Invalid update request!'})
    }
    
        try {
            const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

            // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true })
            if(!task) {
                return res.status(404).send()
            }
            updates.forEach((update) => task[update] = req.body[update])
            await task.save()

            res.send(task)
        } catch(e) {
            res.status(400).send(e)
        }
    })

//Endpoint to delete task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
        if (!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router