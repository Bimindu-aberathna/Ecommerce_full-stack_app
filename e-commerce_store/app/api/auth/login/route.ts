import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  password: string;
  userType: string;
  createdAt: string;
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password }: LoginData = await request.json();
    
    // Read users from file
    const filePath = path.join(process.cwd(), 'public', 'Data', 'users.json');
    
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const users: User[] = JSON.parse(fileData);
      
      // Find user by email
      const user = users.find((u: User) => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check password (in production, use proper password hashing)
      if (user.password !== password) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: 'Account is deactivated' },
          { status: 401 }
        );
      }

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Login successful', 
          user: userWithoutPassword 
        },
        { status: 200 }
      );

    } catch (fileError) {
      console.error('Error reading users file:', fileError);
      return NextResponse.json(
        { success: false, message: 'No users found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
