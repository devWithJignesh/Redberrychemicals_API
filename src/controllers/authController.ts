import { Request, Response } from 'express';
import authService from '../services/authService';
import { sendSuccess, sendError } from '../helpers/responseHelper';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    // Authenticate via AuthService (MongoDB database query + bcrypt password check)
    const authResult = await authService.authenticateUser(email, password);

    if (!authResult) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const { user, token } = authResult;

    const userObj = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: 'SuperAdmin',
      token,
    };

    sendSuccess(res, userObj, 'Login successful');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};
