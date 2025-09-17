//validations for incoming rwquest like sign up request
import {z} from 'zod'

export const signUpPostRequestBodySchema = z.object({
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
});

export const loginPostRequestBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(3),
});

export const shortenPostRequestBodySchema = z.object({
    url : z.string().url(),
    code : z.string().optional(),
});

export const newTargetURLPatchRequestBodySchema = z.object({
    newUrl : z.string().url()
});