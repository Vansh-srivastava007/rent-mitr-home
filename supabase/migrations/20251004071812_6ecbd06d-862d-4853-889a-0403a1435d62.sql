-- Add missing DELETE policies for better user control and data management

-- Messages: Allow users to delete their sent messages
CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
USING (auth.uid() = sender_id);

-- Bookings: Allow users to cancel their own bookings
CREATE POLICY "Users can cancel their own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);

-- Profiles: Allow users to delete their own profile (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
ON profiles FOR DELETE
USING (auth.uid() = user_id);