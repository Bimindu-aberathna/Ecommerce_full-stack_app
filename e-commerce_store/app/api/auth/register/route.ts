import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  password: string;
  userType?: string;
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
    const userData: UserData = await request.json();
    
    // Add user type and other required fields
    const newUser = {
      id: Date.now().toString(), // Simple ID generation
      ...userData,
      userType: "customer",
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Read current users
    const filePath = path.join(process.cwd(), 'public', 'Data', 'users.json');
    let users: User[] = [];
    
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      users = JSON.parse(fileData);
    } catch {
      console.log('No existing users file, creating new one');
      users = [];
    }

    // Check if email already exists
    const existingUser = users.find((user: User) => user.email === userData.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Add new user
    users.push(newUser);

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { success: true, message: 'Registration successful', user: userWithoutPassword },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
