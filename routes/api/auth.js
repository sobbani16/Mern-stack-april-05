const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @route GET api/auth
//@desc Test route
//@access Public

router.get('/', auth, async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route POST api/auth
//@desc Authenticate
//@access Public

router.post('/', [
    check('email', "Please include a valid email").isEmail(),
    check('password', "Password is required").exists()
], 
async (req,res)=>{
   const errors = validationResult(req);

   if(!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
   }

   const { name, email, password } =  req.body;

   try {

    let user = await User.findOne({ email: email});
     // See if the user exists
    if(!user) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if(!isMatched) {
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }


   // Return jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 60*60*24*7*1000}, 
    (err, token)=> {
        if(err) throw err;
        res.json({ token });
    })

   } catch(error) {
       console.error(error.message);
       res.status(500).send("Server error");
   }

   
});

module.exports = router;