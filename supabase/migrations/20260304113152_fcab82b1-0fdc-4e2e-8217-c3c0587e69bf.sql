
-- Confirm the existing user's email
UPDATE auth.users 
SET email_confirmed_at = now(),
    updated_at = now()
WHERE id = '39e323fb-3ee5-4e90-8e07-078791361614';

-- Create the usuario record
INSERT INTO public.usuarios (user_id, nome, email, perfil, ativo)
VALUES ('39e323fb-3ee5-4e90-8e07-078791361614', 'Orlando Martins', 'orlando.faesp@gmail.com', 'congal', true);
