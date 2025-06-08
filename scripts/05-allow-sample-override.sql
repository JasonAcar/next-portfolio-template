-- Update the registration check function to allow override of sample data
CREATE OR REPLACE FUNCTION is_registration_allowed()
RETURNS BOOLEAN AS $$
DECLARE
  profile_count INTEGER;
  has_sample_data BOOLEAN;
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

  -- If no profiles exist, allow registration
  IF profile_count = 0 THEN
    RETURN TRUE;
  END IF;

  -- Check if we only have sample data (John Doe with sample email patterns)
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE name = 'John Doe'
    AND (email LIKE '%example.com%' OR email IS NULL OR email = '')
  ) INTO has_sample_data;

  -- Allow registration if we only have sample data
  IF has_sample_data AND profile_count = 1 THEN
    RETURN TRUE;
  END IF;

  -- Otherwise, don't allow registration
  RETURN FALSE;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's an error, allow registration (fail open)
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the primary user setting function to handle sample data override
CREATE OR REPLACE FUNCTION set_primary_user_on_profile()
RETURNS TRIGGER AS $$
DECLARE
  profile_count INTEGER;
  has_sample_data BOOLEAN;
  sample_profile_id UUID;
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

  -- Check if we have sample data
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE id != NEW.id
    AND name = 'John Doe'
    AND (email LIKE '%example.com%' OR email IS NULL OR email = '')
  ) INTO has_sample_data;

  -- If this is the first profile OR we're replacing sample data, set as primary
  IF profile_count = 0 OR (has_sample_data AND profile_count = 1) THEN
    -- If replacing sample data, delete the sample profile
    IF has_sample_data THEN
      DELETE FROM experiences WHERE user_id IN (
        SELECT user_id FROM profiles
        WHERE name = 'John Doe'
        AND (email LIKE '%example.com%' OR email IS NULL OR email = '')
      );
      DELETE FROM technologies WHERE user_id IN (
        SELECT user_id FROM profiles
        WHERE name = 'John Doe'
        AND (email LIKE '%example.com%' OR email IS NULL OR email = '')
      );
      DELETE FROM blog_posts WHERE user_id IN (
        SELECT user_id FROM profiles
        WHERE name = 'John Doe'
        AND (email LIKE '%example.com%' OR email IS NULL OR email = '')
      );
      DELETE FROM projects WHERE user_id IN (
        SELECT user_id FROM profiles
        WHERE name = 'John Doe'
        AND (email LIKE '%example.com%' OR email IS NULL OR email = '')
      );
      DELETE FROM profiles
      WHERE name = 'John Doe'
      AND (email LIKE '%example.com%' OR email IS NULL OR email = '');
    END IF;

    -- Set the new user as primary
    UPDATE site_settings
    SET primary_user_id = NEW.user_id, updated_at = NOW()
    WHERE id IS NOT NULL;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the profile creation
    RAISE WARNING 'Error in set_primary_user_on_profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the sample data to use a recognizable sample email
UPDATE profiles
SET email = 'john@example.com'
WHERE name = 'John Doe' AND (email IS NULL OR email = '');
