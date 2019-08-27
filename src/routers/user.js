const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')
const router = new express.Router()

//Endpoint to create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()

        //Send Welcome Email
        sendWelcomeEmail(user.email, user.name)

        //Generate Json Web Token and send back to user
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Endpoint to find user by credential (login)
router.post('/users/login', async (req, res) => {
    try {
        //findByCredentials is a customize userSchema
        const user = await User.findByCredentials(req.body.email, req.body.password)

        //Generate Json Web Token and send back to user
        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//Endpoint to logout user
router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

//Endpoint to logout all sessions of user
router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

//Endpoint to Get user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// //Endpost to Get single user by id
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     try{
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

//Endpoint to edit user profile
router.patch('/users/me', auth, async (req, res) => {

//Error handling for updating something that is not allowed
//==========================================================
//Get array of all keys from req.body
const updates = Object.keys(req.body)
//Set what is allowed to be updated
const allowedUpdates = ['name', 'email', 'password', 'age']
//User every operator to check if every updates is allowed
const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
//Check if update operation is valid and return error
if (!isValidOperation){
    return res.status(400).send({ error: 'Invalid update request!'})
}

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

//Endpoint to delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//Endpoint to upload Avatar
//Configuring what type of files for this upload
const avatarUpload = multer({
    //Destination of files to be stored. NOT used cos we will save binary into DB
    // dest: 'avatars',
    limits: {
        //fileSize specified in bytes
        fileSize: 1000000
    },
    //Filter file types
    fileFilter(req, file, cb) {
        //Specify message for invalid file type
        // cb(new Error('File must be a Word document'))
        // //Callback if there is no error
        // cb(undefined, true)

        //Regular expression between //
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be an image'))
        }

        //Accept the file
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//Endpoint to delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

//Endpoint to load user avatar
router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user.avatar || !user){
            throw new Error()
        }
        //Set Response Header
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(500).send()
    }
})
module.exports = router