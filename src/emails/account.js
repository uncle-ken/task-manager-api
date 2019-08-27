const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ken.ngcp@gmail.com',
        subject: 'Thanks for joining in!',
        //ES6 Template String Syntax
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ken.ngcp@gmail.com',
        subject: 'Sad to see you go',
        text: `Goodbye ${name}. Is there anything we can do to make you stay?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}
