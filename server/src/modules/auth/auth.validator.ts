import joi from 'joi';

export function validateSignUpUser(obj: Object) {
   const schema = joi.object({
      username: joi.string().trim().min(2).max(30).required(),
      email: joi.string().trim().min(5).max(50).required().email(),
      password: joi.string().trim().min(6).required(),
   });
   return schema.validate(obj);
}

export function validateSignInUser(obj: Object) {
   const schema = joi.object({
      email: joi.string().trim().min(5).max(50).required().email(),
      password: joi.string().trim().min(6).required(),
   });
   return schema.validate(obj);
}
