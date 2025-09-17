import express from 'express';
import {shortenPostRequestBodySchema, newTargetURLPatchRequestBodySchema} from '../validation/request.validation.js'
import {createUrl} from '../services/url.service.js';
import {nanoid} from 'nanoid';
import {ensureAuthenticated} from '../middlewares/auth.middleware.js'
import { urlsTables } from '../models/url.model.js';
import {getTargetUrlWithShortCode , getAllCodesByUserId} from '../services/url.service.js' 
import { and, eq } from 'drizzle-orm';
import {db} from '../db/index.js'
import { success } from 'zod';



const router = express.Router();

router.post('/shorten',ensureAuthenticated, async (req,res) => {
    
    const validationResult = await shortenPostRequestBodySchema.safeParseAsync(req.body);
    if(validationResult.error){
        return res.status(400).json({ error : validationResult.error.format()});
    }

    const { url , code } = validationResult.data;
    
    //Generating a shortcode for Short url if user is not giving in the req body
    const shortcode = code ?? nanoid(6);
    
    //creating an DB entry of URL Given by user 
    const urlEntry = await createUrl(req.user.id,shortcode,url);
    return res.status(201).json({ id: urlEntry.id, shortcode: urlEntry.shortcode, targetURL : urlEntry.targetURL});



});

router.get('/codes' , ensureAuthenticated, async (req,res) =>{
    const codes = await getAllCodesByUserId(req.user.id);

    return res.status(200).json({codes});
});

router.patch('/update/:id', ensureAuthenticated , async (req,res) => {
    const id = req.params.id;

    const validationResult = await newTargetURLPatchRequestBodySchema.safeParseAsync(req.body);
    if(validationResult.error){
        return res.status(400).json({ error : validationResult.error.format()});
    }
    const {newUrl} = validationResult.data;

    await db
    .update(urlsTables)
    .set({targetURL : newUrl})
    .where(and(eq(urlsTables.id,id) , eq(urlsTables.userId,req.user.id)));

    return res.status(201).json({ update : success});
       
});

router.delete('/:id',ensureAuthenticated, async (req,res) => {
    const id = req.params.id;
    await db
    .delete(urlsTables)
    .where(and(eq(urlsTables.id,id), eq(urlsTables.userId,req.user.id)));

    return res.status(200).json({ deleted : true });
});

router.get('/:shortCode' , async (req,res) => {
    const code = req.params.shortCode;
    const result = await getTargetUrlWithShortCode(code); 
    if(!result)
    {
        return res.status(404).json({ error : 'Invalid URL Link'});
    }
    return res.redirect(result.targetURL);

});

export default router;