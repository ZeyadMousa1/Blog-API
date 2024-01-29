import joi from 'joi';

export function validateCreateCategory(obj: Object) {
   const schema = joi.object({
      title: joi.string().trim().required().label('Title'),
   });
   return schema.validate(obj);
}
