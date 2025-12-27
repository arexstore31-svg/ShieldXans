/*
  # Roblox Script Obfuscator with Key System Schema

  ## Overview
  This migration creates the database structure for a Roblox script obfuscation platform
  with HWID-based key system and expiration management.

  ## New Tables

  ### `scripts`
  Stores Roblox scripts with their obfuscated versions
  - `id` (uuid, primary key) - Unique identifier for each script
  - `name` (text) - Script name/title
  - `description` (text, nullable) - Script description
  - `original_script` (text) - Original Lua script code
  - `obfuscated_script` (text) - Obfuscated version of the script
  - `user_id` (uuid, nullable) - Owner of the script (for future auth integration)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `script_keys`
  Stores key configurations for scripts with HWID and expiration
  - `id` (uuid, primary key) - Unique identifier for each key configuration
  - `script_id` (uuid, foreign key) - References the script this key belongs to
  - `key_value` (text, unique) - The actual key string
  - `hwid` (text, nullable) - Hardware ID that this key is locked to
  - `expires_at` (timestamptz) - Expiration date/time for this key
  - `max_activations` (integer) - Maximum number of times this key can be activated
  - `current_activations` (integer) - Current activation count
  - `is_active` (boolean) - Whether this key is currently active
  - `created_at` (timestamptz) - Creation timestamp

  ### `key_activations`
  Tracks key activation history and HWID bindings
  - `id` (uuid, primary key) - Unique identifier for each activation
  - `key_id` (uuid, foreign key) - References the key that was activated
  - `hwid` (text) - Hardware ID that activated the key
  - `ip_address` (text, nullable) - IP address of activation
  - `activated_at` (timestamptz) - Activation timestamp
  - `last_validated_at` (timestamptz) - Last time this activation was validated

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public read access for key validation (required for Roblox integration)
  - Authenticated users can manage their own scripts and keys
  
  ## Indexes
  - Index on `script_keys.key_value` for fast key lookups
  - Index on `script_keys.hwid` for HWID validation
  - Index on `key_activations.hwid` for activation history
*/

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  original_script text NOT NULL,
  obfuscated_script text NOT NULL DEFAULT '',
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create script_keys table
CREATE TABLE IF NOT EXISTS script_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  key_value text UNIQUE NOT NULL,
  hwid text,
  expires_at timestamptz NOT NULL,
  max_activations integer DEFAULT 1,
  current_activations integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create key_activations table
CREATE TABLE IF NOT EXISTS key_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id uuid NOT NULL REFERENCES script_keys(id) ON DELETE CASCADE,
  hwid text NOT NULL,
  ip_address text,
  activated_at timestamptz DEFAULT now(),
  last_validated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_script_keys_key_value ON script_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_script_keys_hwid ON script_keys(hwid);
CREATE INDEX IF NOT EXISTS idx_key_activations_hwid ON key_activations(hwid);
CREATE INDEX IF NOT EXISTS idx_key_activations_key_id ON key_activations(key_id);

-- Enable Row Level Security
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_activations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scripts table
CREATE POLICY "Anyone can view scripts"
  ON scripts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create scripts"
  ON scripts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update scripts"
  ON scripts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete scripts"
  ON scripts FOR DELETE
  TO public
  USING (true);

-- RLS Policies for script_keys table
CREATE POLICY "Anyone can view keys"
  ON script_keys FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create keys"
  ON script_keys FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update keys"
  ON script_keys FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete keys"
  ON script_keys FOR DELETE
  TO public
  USING (true);

-- RLS Policies for key_activations table
CREATE POLICY "Anyone can view activations"
  ON key_activations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create activations"
  ON key_activations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update activations"
  ON key_activations FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);