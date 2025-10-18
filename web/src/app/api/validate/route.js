import sql from '@/app/api/utils/sql';

export async function POST(request) {
  try {
    const { appId, appSecret, key, hwid } = await request.json();

    if (!appId || !appSecret || !key) {
      return Response.json({ 
        success: false, 
        error: 'Application ID, secret, and key are required' 
      }, { status: 400 });
    }

    // Verify application credentials
    const apps = await sql`
      SELECT id, user_id FROM applications 
      WHERE app_id = ${appId} AND app_secret = ${appSecret}
    `;

    if (apps.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Invalid application credentials' 
      }, { status: 401 });
    }

    const application = apps[0];

    // Check if key exists and is valid
    const keys = await sql`
      SELECT 
        k.id,
        k.hwid_enabled,
        k.hwid_value,
        k.expires_at,
        k.is_active,
        u.is_active as user_active
      FROM keys k
      JOIN users u ON k.user_id = u.id
      WHERE k.key_value = ${key} AND k.application_id = ${application.id}
    `;

    if (keys.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Invalid key' 
      }, { status: 404 });
    }

    const keyData = keys[0];

    // Check if user is active
    if (!keyData.user_active) {
      return Response.json({ 
        success: false, 
        error: 'User account is disabled' 
      }, { status: 403 });
    }

    // Check if key is active
    if (!keyData.is_active) {
      return Response.json({ 
        success: false, 
        error: 'Key is disabled' 
      }, { status: 403 });
    }

    // Check if key has expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return Response.json({ 
        success: false, 
        error: 'Key has expired' 
      }, { status: 403 });
    }

    // Handle HWID binding
    if (keyData.hwid_enabled) {
      if (!hwid) {
        return Response.json({ 
          success: false, 
          error: 'HWID is required for this key' 
        }, { status: 400 });
      }

      if (!keyData.hwid_value) {
        // First time binding - store the HWID
        await sql`
          UPDATE keys 
          SET hwid_value = ${hwid}, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ${keyData.id}
        `;
      } else if (keyData.hwid_value !== hwid) {
        // HWID mismatch
        return Response.json({ 
          success: false, 
          error: 'HWID mismatch' 
        }, { status: 403 });
      }
    }

    // Key is valid
    return Response.json({ 
      success: true,
      message: 'Key validation successful',
      data: {
        keyId: keyData.id,
        hwidEnabled: keyData.hwid_enabled,
        expiresAt: keyData.expires_at
      }
    });

  } catch (error) {
    console.error('Key validation error:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}