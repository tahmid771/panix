import sql from '@/app/api/utils/sql';

// Get all applications for a user
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const applications = await sql`
      SELECT 
        a.id,
        a.name,
        a.app_id,
        a.app_secret,
        a.created_at,
        COUNT(k.id) as key_count
      FROM applications a
      LEFT JOIN keys k ON a.id = k.application_id
      WHERE a.user_id = ${userId}
      GROUP BY a.id, a.name, a.app_id, a.app_secret, a.created_at
      ORDER BY a.created_at DESC
    `;

    return Response.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return Response.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// Create new application
export async function POST(request) {
  try {
    const { userId, name } = await request.json();

    if (!userId || !name) {
      return Response.json({ error: 'User ID and application name are required' }, { status: 400 });
    }

    // Generate unique app ID and secret
    const appId = 'app_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const appSecret = 'sec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const result = await sql`
      INSERT INTO applications (user_id, name, app_id, app_secret)
      VALUES (${userId}, ${name}, ${appId}, ${appSecret})
      RETURNING id, name, app_id, app_secret, created_at
    `;

    return Response.json({ 
      success: true, 
      application: result[0],
      message: 'Application created successfully'
    });
  } catch (error) {
    console.error('Create application error:', error);
    return Response.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

// Delete application
export async function DELETE(request) {
  try {
    const { applicationId, userId } = await request.json();

    if (!applicationId || !userId) {
      return Response.json({ error: 'Application ID and User ID are required' }, { status: 400 });
    }

    await sql`
      DELETE FROM applications 
      WHERE id = ${applicationId} AND user_id = ${userId}
    `;

    return Response.json({ 
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    return Response.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}