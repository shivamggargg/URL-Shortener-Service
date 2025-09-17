import { eq } from 'drizzle-orm';
import express from 'express'
import {db} from '../db/index.js'
import{usersTable} from '../models/index.js'
import {signUpPostRequestBodySchema, loginPostRequestBodySchema} from '../validation/request.validation.js'
import {hashedPasswordWithSalt} from '../utils/hash.js'
import {getUserByEmail , createUser} from '../services/user.service.js'
import jwt from 'jsonwebtoken';
import {createUserToken} from '../utils/token.js';


const router = express.Router();

router.post('/signup', async (req,res) =>{
    //validation req body b using zod  
    const validationResult = await signUpPostRequestBodySchema.safeParseAsync(req.body);
    if(validationResult.error)
    {
        return res.status(400).json({ error : validationResult.error.format() });
    }
    const {firstname, lastname , email, password} = validationResult.data;

    //Check if user with Email already exists
    const existingUser = await getUserByEmail(email);
    if(existingUser) 
        return res.status(400).json({error : `user with email ${email} already exists! `});
    
    //hashing the password with salt before store in DB.
    const {salt, password : hashedPassword} = hashedPasswordWithSalt(password);  
        
    //Creating a user 
    const user = await createUser(email,firstname,lastname,salt,hashedPassword);
    return res.status(201).json({ data : { userId: user.id }});
});

router.post('/login', async (req,res) =>{
    const validationResult = await loginPostRequestBodySchema.safeParseAsync(req.body);
    if(validationResult.error)
    {
        return res.status(400).json({ error : validationResult.error.format() });
    } 
    const {email, password} = validationResult.data;

    const user = await getUserByEmail(email);
    if(!user){
        return res.status(404).json({ error: `user with email ${email} does not exists!` });
    }

    const {salt, password:hashedPassword} = hashedPasswordWithSalt(password, user.salt);

    if(hashedPassword != user.password){
        res.status(400).json({ error : `invalid password` });
    }

    const token = await createUserToken({ id : user.id });
    return res.json({ token });


});

export default router;