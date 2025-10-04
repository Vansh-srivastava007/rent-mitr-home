-- Add input validation to handle_new_user() function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_full_name text;
  v_phone text;
  v_address text;
BEGIN
  -- Extract and trim values
  v_full_name := TRIM(NEW.raw_user_meta_data ->> 'full_name');
  v_phone := TRIM(NEW.raw_user_meta_data ->> 'phone_number');
  v_address := TRIM(NEW.raw_user_meta_data ->> 'address');
  
  -- Validate required fields
  IF v_full_name IS NULL OR v_full_name = '' THEN
    RAISE EXCEPTION 'full_name is required';
  END IF;
  
  IF v_phone IS NULL OR v_phone = '' THEN
    RAISE EXCEPTION 'phone_number is required';
  END IF;
  
  IF v_address IS NULL OR v_address = '' THEN
    RAISE EXCEPTION 'address is required';
  END IF;
  
  -- Validate lengths (prevent DoS and data integrity issues)
  IF LENGTH(v_full_name) > 200 THEN
    RAISE EXCEPTION 'full_name must be less than 200 characters';
  END IF;
  
  IF LENGTH(v_phone) > 20 THEN
    RAISE EXCEPTION 'phone_number must be less than 20 characters';
  END IF;
  
  IF LENGTH(v_address) > 500 THEN
    RAISE EXCEPTION 'address must be less than 500 characters';
  END IF;
  
  -- Insert validated data
  INSERT INTO public.profiles (user_id, full_name, phone_number, address)
  VALUES (NEW.id, v_full_name, v_phone, v_address);
  
  RETURN NEW;
END;
$$;