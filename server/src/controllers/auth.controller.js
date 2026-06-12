import * as authService from '../services/auth.service.js';


const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', 
  maxAge: 24 * 60 * 60 * 1000, 
};

export async function login (req,res,next) {
    try {
        const {email, password} = req.body;
        const result = await authService.loginUser(email, password);
        res.cookie('token', result.token, COOKIE_OPTIONS);
        res.json({
            success: true,
            data: {
                accessToken: result.token,
                requiresPasswordChange: result.user.mustChangePassword,
                user: result.user,
            },
            });
        
        res.json({ success: true, user });
    }
    catch(err) {
        next(err);
    }
}