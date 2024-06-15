import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const signup = async (req, res, next) => {
    // console.log(req.body); 
    const { username, email, password } = req.body;
    if(!username || !email || !password || username === '' || email === '' || password === ''){
        // return res.status(400).json({message: "All fields are required"});
        next(errorHandler(400, "All fields are required"));
    }
    const hashedPassword = await bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    try{
        await newUser.save();
        res.json({message: "Signup successful"});
    }
    catch(err){ 
        // res.status(500).json({message: err.message});
        next(err);
    }

};

export const signin = async (req, res, next) => {
    const { email, password } = req.body;
    if(!email || !password || email==='' || password===''){
        next(errorHandler(400, "All fields are required"));
    }
    try{
        const validUser = await User.findOne({ email: email})
        if(!validUser){
            return next(errorHandler(404, "Invalid credentials"));
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if(!validPassword){
            return next(errorHandler(404, "Invalid credentials"));
        }
        const token = jwt.sign(
            { id: validUser._id, }, 
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h'}

        )
        const {password : pass, ...rest} = validUser._doc;
        res.status(200).cookie('access_token', token, { httpOnly: true }).json(rest);
    }
    catch(err){
        next(err);
    }
};