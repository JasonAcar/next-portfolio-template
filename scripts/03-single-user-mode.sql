-- Create site_settings table to manage single-user mode
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  single_user_mode BOOLEAN DEFAULT true,
  primary_user_id UUID REFERENCES auth.users(id),
  site_name TEXT DEFAULT 'Portfolio',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (single_user_mode, primary_user_id) VALUES (true, NULL);

-- Enable RLS for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site settings
CREATE POLICY "Site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);

-- Only allow authenticated users to update site settings
CREATE POLICY "Authenticated users can update site settings" ON site_settings FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create function to check if registration is allowed
CREATE OR REPLACE FUNCTION is_registration_allowed()
RETURNS BOOLEAN AS $$
DECLARE
  settings_record RECORD;
  user_count INTEGER;
BEGIN
  -- Get site settings
  SELECT * INTO settings_record FROM site_settings LIMIT 1;

  -- If single user mode is disabled, allow registration
  IF NOT settings_record.single_user_mode THEN
    RETURN TRUE;
  END IF;

  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM auth.users;

  -- Allow registration if no users exist
  RETURN user_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set primary user after first registration
CREATE OR REPLACE FUNCTION set_primary_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO user_count FROM auth.users;

  -- If this is the first user, set them as primary
  IF user_count = 1 THEN
    UPDATE site_settings
    SET primary_user_id = NEW.id, updated_at = NOW()
    WHERE id = (SELECT id FROM site_settings LIMIT 1);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set primary user
CREATE OR REPLACE TRIGGER set_primary_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION set_primary_user();
