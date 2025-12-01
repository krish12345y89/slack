import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser, JwtPayload } from '../interfaces';

class AuthService {
  private static instance: AuthService;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  private constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = this.generateToken(user);
    return { user, token };
  }

  public async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    user.isOnline = true;
    await user.save();

    const token = this.generateToken(user);
    return { user, token };
  }

  public async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });
  }

  public generateToken(user: IUser): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.jwtSecret) as JwtPayload;
  }

  public async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-password');
  }

  public async updateUserOnlineStatus(
    userId: string,
    isOnline: boolean
  ): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date(),
    });
  }
}

export default AuthService;
