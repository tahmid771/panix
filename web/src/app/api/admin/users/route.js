import sql from '@/app/api/utils/sql';

// Get all users for admin dashboard
export async function GET(request) {
  try {
    const users = await sql`
      SELECT 
        u.id,
        u.email,
        u.user_type,
        u.is_active,
        u.key_limit,
        u.created_at,
        COUNT(k.id) as key_count,
        COUNT(DISTINCT a.id) as app_count
      FROM users u
      LEFT JOIN keys k ON u.id = k.user_id
      LEFT JOIN applications a ON u.id = a.user_id
      WHERE u.user_type != 'admin'
      GROUP BY u.id, u.email, u.user_type, u.is_active, u.key_limit, u.created_at
      ORDER BY u.created_at DESC
    `;

    return Response.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Create new user
export async function POST(request) {
  try {
    const { email, password, userType, keyLimit } = await request.json();

    if (!email || !password || !userType) {
      return Response.json({ error: 'Email, password, and user type are required' }, { status: 400 });
    }

    if (!['user', 'reseller'].includes(userType)) {
      return Response.json({ error: 'Invalid user type' }, { status: 400 });
    }

    // Check if email already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      return Response.json({ error: 'Email already exists' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO users (email, password_hash, user_type, key_limit)
      VALUES (${email}, ${password}, ${userType}, ${keyLimit || null})
      RETURNING id, email, user_type, key_limit, created_at
    `;

    return Response.json({ 
      success: true, 
      user: result[0],
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// Update user status
export async function PATCH(request) {
  try {
    const { userId, isActive } = await request.json();

    if (!userId || typeof isActive !== 'boolean') {
      return Response.json({ error: 'User ID and active status are required' }, { status: 400 });
    }

    await sql`
      UPDATE users 
      SET is_active = ${isActive}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId} AND user_type != 'admin'
    `;

    return Response.json({ 
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user error:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM users WHERE id = ${userId} AND user_type != 'admin'`;

    return Response.json({ 
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}