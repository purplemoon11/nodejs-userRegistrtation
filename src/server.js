const express = require('express')
const app = express()
const mongoose = require('mongoose')
const env = require('dotenv')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./model/user')

const JWT_SECRET = "mernSECRET"

env.config()

app.use(express.json());

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
   
    const {username, password: plainTextPassword} = req.body;

    if(!username || typeof username !== 'string'){
        return res.json({ status: 'error', error: 'Invalid username'})
    }

    if(plainTextPassword.length<5){
        return res.json({ status:'error', error: 'Password too small. Should be atleast 6 characters' })
    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try {
        const response = await User.create({
            username,
            password
        })
        console.log('User created successfully:', response)
    } catch (error) {
        if(error.code === 11000){
        return res.json({ status: 'error', error:"Username already exists."})
    }
    throw error
}

    res.json({ status: 'ok' })
})

app.post('/api/change-password', async (req, res) => {
    const { token, newpassword : plainTextPassword } = req.body


    if(!username || typeof username !== 'string'){
        return res.json({ status: 'error', error: 'Invalid username'})
    }

    if(plainTextPassword.length<5){
        return res.json({ status:'error', error: 'Password too small. Should be atleast 6 characters' })
    }

    try {
        const user = jwt.verify(token, JWT_SECRET)
        const id = user._id
        const password = await bcrypt.hash(plainTextPassword, 10)
        await User.updateOne({_id}, {
            $set: {password}
        })
        res.send({status:"ok"})
    } catch (error) {
        res.json({ status: "error", error: ";))" })
    }
    const user = jwt.verify(token, JWT_SECRET)

    console.log('jwt decoded', user)
})

mongoose
.connect(
    `mongodb+srv://auth:${process.env.MONGO_PW}@cluster0.uw1ut.mongodb.net/${process.env.LOGIN_SYS}?retryWrites=true&w=majority`
    ).then(()=>{
        console.log("Database connected.")
    })

app.listen(process.env.PORT, ()=>{
    console.log(`Server is up at ${process.env.PORT}`)
})
