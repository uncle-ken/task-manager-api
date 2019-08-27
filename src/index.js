const express = require('express')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const multer = require('multer')

//Requiring Mongoose file to run DB
require('./db/mongoose')

const app = express()
const port = process.env.PORT

// //Sample code for file upload
// //Configuring what type of files for this upload
// const upload = multer({
//     //Destination of files to be stored
//     dest: 'images',
//     limits: {
//         //fileSize specified in bytes
//         fileSize: 1000000
//     },
//     //Filter file types
//     fileFilter(req, file, cb) {
//         //Specify message for invalid file type
//         // cb(new Error('File must be a Word document'))
//         // //Callback if there is no error
//         // cb(undefined, true)

//         //Regular expression between //
//         if (!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('File must be a Word document'))
//         }

//         cb(undefined, true)
//     }
// })
// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message})
// })


// Maintenance middleware
// app.use ((req, res, next) => {
//     res.status(503).send('The site is currently under maintenance')
// })

//Tell express to automatically parse all incoming JSON to Objects
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
