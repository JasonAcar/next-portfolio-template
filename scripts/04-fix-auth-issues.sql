-- Clean up any existing triggers and functions first
DROP TRIGGER IF EXISTS set_primary_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS set_primary_user_trigger ON profiles;
DROP FUNCTION IF EXISTS set_primary_user();
DROP FUNCTION IF EXISTS set_primary_user_on_profile();
DROP FUNCTION IF EXISTS is_registration_allowed();

-- Create the function FIRST, then the trigger
CREATE OR REPLACE FUNCTION set_primary_user_on_profile()
RETURNS TRIGGER AS $$
DECLARE
  profile_count INTEGER;
  settings_exists BOOLEAN;
BEGIN
  -- Check if site_settings table exists and has data
  SELECT EXISTS(SELECT 1 FROM site_settings LIMIT 1) INTO settings_exists;

  -- If no settings exist, create default settings
  IF NOT settings_exists THEN
    INSERT INTO site_settings (single_user_mode, primary_user_id)
    VALUES (true, NEW.user_id);
    RETURN NEW;
  END IF;

  -- Count existing profiles (excluding the current one being inserted)
  SELECT COUNT(*) INTO profile_count FROM profiles WHERE id != NEW.id;

  -- If this is the first profile, set the user as primary
  IF profile_count = 0 THEN
    UPDATE site_settings
    SET primary_user_id = NEW.user_id, updated_at = NOW()
    WHERE primary_user_id IS NULL;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the profile creation
    RAISE WARNING 'Error in set_primary_user_on_profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOW create the trigger that references the function
CREATE OR REPLACE TRIGGER set_primary_user_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_primary_user_on_profile();

-- Recreate the registration check function (simplified version)
CREATE OR REPLACE FUNCTION is_registration_allowed()
RETURNS BOOLEAN AS $$
DECLARE
  profile_count INTEGER;
  settings_record RECORD;
BEGIN
  -- Get site settings
  SELECT * INTO settings_record FROM site_settings LIMIT 1;

  -- If single user mode is disabled, allow registration
  IF settings_record IS NULL OR NOT settings_record.single_user_mode THEN
    RETURN TRUE;
  END IF;

  -- Count existing profiles
  SELECT COUNT(*) INTO profile_count FROM profiles;

  -- Allow registration if no profiles exist
  RETURN profile_count = 0;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's an error, allow registration (fail open)
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up and recreate RLS policies
DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Ensure site_settings policies are correct
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;

CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Make sure we have default site settings (use ON CONFLICT to avoid duplicates)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM site_settings) THEN
    INSERT INTO site_settings (single_user_mode, primary_user_id)
    VALUES (true, NULL);
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON site_settings TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON projects TO anon, authenticated;
GRANT ALL ON blog_posts TO anon, authenticated;
GRANT ALL ON technologies TO anon, authenticated;
GRANT ALL ON experiences TO anon, authenticated;
