const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require("express-validator");


const Profile = require('../../models/Profile');
const User = require('../../models/User');


// @route GET api/profile/me
//@desc Get current users profile
//@access private

router.get('/me', auth, async (req,res)=> {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if(!profile){
           return res.status(400).json({
                msg: "There is no profile for this user"
            });
        } 
    } catch(error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});


// @route POST api/profile
//@desc create or update user profile
//@access private

    router.post('/',[auth, [
        check('status', "Status is required").not().isEmpty(),
        check('skills', "Skills is required").not().isEmpty()
    ]], async (req, res)=> {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;
        // Build profile object

        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        //Build social object
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(facebook) profileFields.social.facebook = facebook;
        if(twitter) profileFields.social.twitter = twitter;
        if(instagram) profileFields.social.instagram = instagram;
        if(linkedin) profileFields.social.linkedin = linkedin;
        
        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if(profile) {
                // update
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
                return res.json(profile);
            }
                //Create
                profile = new Profile(profileFields);

                await profile.save();
                res.json(profile);
        } catch(error) {
            console.error(error.message);
            res.status(500).send("Server error");
        }
    });

// @route GET api/profile
//@desc Get all profiles 
//@access public

router.get("/", async (req, res) => {
    try {
        profiles = await Profile.find().populate( 'user', ['name', 'avatar']);
        res.json(profiles);
        
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Server error");
    }
})

// @route GET api/profile
//@desc Get all profiles 
//@access public

module.exports = router;