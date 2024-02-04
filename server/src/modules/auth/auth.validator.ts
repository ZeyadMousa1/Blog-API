import joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

export function validateSignUpUser(obj: Object) {
   const schema = joi.object({
      username: joi.string().trim().min(2).max(30).required(),
      email: joi.string().trim().min(5).max(50).required().email(),
      password: passwordComplexity().required(),
   });
   return schema.validate(obj);
}

export function validateSignInUser(obj: Object) {
   const schema = joi.object({
      email: joi.string().trim().min(5).max(50).required().email(),
      password: joi.string().min(8).max(25).required(),
   });
   return schema.validate(obj);
}

export function validateEmail(obj: Object) {
   const schema = joi.object({
      email: joi.string().trim().min(5).max(50).required().email(),
   });
   return schema.validate(obj);
}

export function validateNewPassword(obj: Object) {
   const schema = joi.object({
      password: passwordComplexity().required(),
   });
   return schema.validate(obj);
}
