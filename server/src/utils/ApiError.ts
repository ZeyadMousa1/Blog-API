export class ApiError extends Error {
   statusCode: number;
   statusText: string;
   constructor(message: string, statusCode: number, statusText: string) {
      super(message);
      this.statusCode = statusCode;
      this.statusText = statusText;
   }
}

export const createError = (message: string, statusCode: number, statusText: string) => {
   return new ApiError(message, statusCode, statusText);
};
