INSERT INTO "auth"."account" (id, account_id, provider_id, user_id, password, created_at, updated_at) 
VALUES (
  '0123456789',
  '0123456789',
  'credential',
  '0123456789',
  '$argon2id$v=19$m=65536,t=3,p=4$Qqugn2LBFlQOeZaDzYPg/A$p7qDZBxd5adCow4TDRteJDsd3pjrerXtQ6ZcELCStCI',
  NOW(),
  NOW()
);
