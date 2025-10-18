import sql from "@/app/api/utils/sql";

// Get all keys for a user
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const applicationId = url.searchParams.get("applicationId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    let query;
    if (applicationId) {
      query = sql`
        SELECT 
          k.id,
          k.key_value,
          k.hwid_enabled,
          k.hwid_value,
          k.expires_at,
          k.is_active,
          k.created_at,
          a.name as application_name
        FROM keys k
        JOIN applications a ON k.application_id = a.id
        WHERE k.user_id = ${userId} AND k.application_id = ${applicationId}
        ORDER BY k.created_at DESC
      `;
    } else {
      query = sql`
        SELECT 
          k.id,
          k.key_value,
          k.hwid_enabled,
          k.hwid_value,
          k.expires_at,
          k.is_active,
          k.created_at,
          a.name as application_name
        FROM keys k
        JOIN applications a ON k.application_id = a.id
        WHERE k.user_id = ${userId}
        ORDER BY k.created_at DESC
      `;
    }

    const keys = await query;
    return Response.json({ keys });
  } catch (error) {
    console.error("Get keys error:", error);
    return Response.json({ error: "Failed to fetch keys" }, { status: 500 });
  }
}

// Create new key
export async function POST(request) {
  try {
    const {
      userId,
      applicationId,
      keyType = "random",
      customKey,
      hwidEnabled = false,
      expiresIn,
    } = await request.json();

    if (!userId || !applicationId) {
      return Response.json(
        { error: "User ID and Application ID are required" },
        { status: 400 },
      );
    }

    // Check if user can create more keys (for resellers)
    const user =
      await sql`SELECT user_type, key_limit FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user[0].user_type === "reseller" && user[0].key_limit !== null) {
      const keyCount =
        await sql`SELECT COUNT(*) as count FROM keys WHERE user_id = ${userId}`;
      if (keyCount[0].count >= user[0].key_limit) {
        return Response.json({ error: "Key limit reached" }, { status: 400 });
      }
    }

    // Generate or use custom key
    let keyValue;
    if (keyType === "custom" && customKey) {
      // Check if custom key already exists
      const existingKey =
        await sql`SELECT id FROM keys WHERE key_value = ${customKey}`;
      if (existingKey.length > 0) {
        return Response.json({ error: "Key already exists" }, { status: 400 });
      }
      keyValue = customKey;
    } else {
      // Generate random key
      keyValue =
        "key_" +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    }

    // Calculate expiration date
    let expiresAt = null;
    if (expiresIn) {
      const now = new Date();
      expiresAt = new Date(now.getTime() + expiresIn * 24 * 60 * 60 * 1000); // days to milliseconds
    }

    const result = await sql`
      INSERT INTO keys (user_id, application_id, key_value, hwid_enabled, expires_at)
      VALUES (${userId}, ${applicationId}, ${keyValue}, ${hwidEnabled}, ${expiresAt})
      RETURNING id, key_value, hwid_enabled, expires_at, created_at
    `;

    return Response.json({
      success: true,
      key: result[0],
      message: "Key created successfully",
    });
  } catch (error) {
    console.error("Create key error:", error);
    return Response.json({ error: "Failed to create key" }, { status: 500 });
  }
}

// Update key
export async function PATCH(request) {
  try {
    const { keyId, userId, hwidEnabled, resetHwid } = await request.json();

    if (!keyId || !userId) {
      return Response.json(
        { error: "Key ID and User ID are required" },
        { status: 400 },
      );
    }

    // Handle different update scenarios
    if (resetHwid) {
      // Reset HWID value
      await sql`
        UPDATE keys 
        SET hwid_value = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${keyId} AND user_id = ${userId}
      `;
    } else if (typeof hwidEnabled === "boolean") {
      // Toggle HWID enabled/disabled
      await sql`
        UPDATE keys 
        SET hwid_enabled = ${hwidEnabled}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${keyId} AND user_id = ${userId}
      `;
    } else {
      return Response.json(
        { error: "No valid update parameters provided" },
        { status: 400 },
      );
    }

    return Response.json({
      success: true,
      message: "Key updated successfully",
    });
  } catch (error) {
    console.error("Update key error:", error);
    return Response.json({ error: "Failed to update key" }, { status: 500 });
  }
}

// Delete key
export async function DELETE(request) {
  try {
    const { keyId, userId } = await request.json();

    if (!keyId || !userId) {
      return Response.json(
        { error: "Key ID and User ID are required" },
        { status: 400 },
      );
    }

    await sql`
      DELETE FROM keys 
      WHERE id = ${keyId} AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      message: "Key deleted successfully",
    });
  } catch (error) {
    console.error("Delete key error:", error);
    return Response.json({ error: "Failed to delete key" }, { status: 500 });
  }
}
