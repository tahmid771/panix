import sql from '@/app/api/utils/sql';

export async function POST(request) {
  try {
    const { email, password, userType } = await request.json();

    if (!email || !password || !userType) {
      return Response.json({ error: 'Email, password, and user type are required' }, { status: 400 });
    }

    // Special handling for admin login
    if (userType === 'admin') {
      // Check if admin setup is completed
      const setupResult = await sql`SELECT is_completed FROM admin_setup LIMIT 1`;
      const isSetupCompleted = setupResult[0]?.is_completed || false;

      if (!isSetupCompleted) {
        // First time admin setup
        if (email === 'skabdulhamim254@gmail.com' && password === 'tahmid786') {
          // Create admin user
          const hashedPassword = password; // In production, use proper hashing
          await sql`
            INSERT INTO users (email, password_hash, user_type) 
            VALUES (${email}, ${hashedPassword}, 'admin')
          `;
          
          // Mark setup as completed
          await sql`UPDATE admin_setup SET is_completed = true, completed_at = CURRENT_TIMESTAMP`;
          
          return Response.json({ 
            success: true, 
            user: { id: 1, email, userType: 'admin' },
            message: 'Admin account created successfully'
          });
        } else {
          return Response.json({ error: 'Invalid admin credentials' }, { status: 401 });
        }
      } else {
        // Normal admin login
        const users = await sql`
          SELECT id, email, user_type, is_active 
          FROM users 
          WHERE email = ${email} AND password_hash = ${password} AND user_type = 'admin'
        `;
        
        if (users.length === 0) {
          return Response.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = users[0];
        if (!user.is_active) {
          return Response.json({ error: 'Account is disabled' }, { status: 401 });
        }

        return Response.json({ 
          success: true, 
          user: { id: user.id, email: user.email, userType: user.user_type }
        });
      }
    } else {
      // User or Reseller login
      const users = await sql`
        SELECT id, email, user_type, is_active 
        FROM users 
        WHERE email = ${email} AND password_hash = ${password} AND user_type = ${userType}
      `;
      
      if (users.length === 0) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const user = users[0];
      if (!user.is_active) {
        return Response.json({ error: 'Account is disabled' }, { status: 401 });
      }

      return Response.json({ 
        success: true, 
        user: { id: user.id, email: user.email, userType: user.user_type }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}