-- Manual Email Verification Script
-- Use this to manually verify email addresses for testing

-- Verify all admin accounts
UPDATE "userTable"
SET email_verified = true
WHERE email LIKE '%@nestly.com'
   OR email LIKE 'admin@%';

-- Verify all manager accounts
UPDATE "userTable"
SET email_verified = true
WHERE email IN (
  SELECT u.email
  FROM "userTable" u
  JOIN "userRolesTable" ur ON u.id = ur.user_id
  WHERE ur.role = 'hotel-manager'
);

-- Or verify a specific email
-- UPDATE "userTable"
-- SET email_verified = true
-- WHERE email = 'your-email@example.com';

-- Check verification status
SELECT
  u.id,
  u.email,
  u.username,
  u.email_verified,
  ur.role,
  u.created_at
FROM "userTable" u
LEFT JOIN "userRolesTable" ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;
