export const verifyEmail = (token: string, userId: string): string => {
   const verificationLink = `${process.env.BASE_URL}/api/auth/${userId}/verify}`;
   return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }

          .container {
            max-width: 600px;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          .header {
            background-color: #3498db;
            color: #fff;
            padding: 20px;
            text-align: center;
          }

          .content {
            padding: 20px;
          }

          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Email Verification</h2>
          </div>
          <div class="content">
            <p>Thank you for signing up! Please click the link below to verify your email address:</p>
            <a class="button" href="${verificationLink}" target="_blank">Verify Email</a>
            <p>If you didn't sign up for this service, you can ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// export const resetPasswoedCode = (token: string, userId: string): string => {
//     const resetPasswordLink = `${process.env.BASE_URL}/api/auth/reset-password/${userId}`
//    return `
//     <h1>Reset Password</h1>
//     <p>your reset password code is ${code}</p>
//     `;
// };
