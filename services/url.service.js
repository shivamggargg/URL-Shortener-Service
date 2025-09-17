import {db} from '../db/index.js'
import{urlsTables, usersTable} from '../models/index.js'
import { and, eq } from 'drizzle-orm';


export async function createUrl(userID,shortcode,url) {
    //console.log("Params@ : ",userID,shortcode,url);
    const [urlEntry] = await db.insert(urlsTables).values({
        usedId: userID,
        shortCode: shortcode,
        targetURL : url,
    }).returning({ id : urlsTables.id, 
        shortcode: urlsTables.shortCode, 
        targetURL: urlsTables.targetURL 
    });

    return urlEntry;
}

export async function getTargetUrlWithShortCode(code) {
    const [result] = await db
    .select()
    .from(urlsTables)
    .where(eq(code,urlsTables.shortCode));
    
    return result;
}

export async function getAllCodesByUserId(userID){
    const result = await db
    .select()
    .from(urlsTables)
    .where(eq(urlsTables.userId, userID));

    return result;
}

