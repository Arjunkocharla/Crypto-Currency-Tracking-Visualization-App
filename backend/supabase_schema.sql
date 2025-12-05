-- Supabase Database Schema for Crypto Portfolio Tracker
-- Run this in your Supabase SQL Editor

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    symbol VARCHAR(10) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
    value_usd DECIMAL(20, 8) NOT NULL,
    purchased_price DECIMAL(20, 8) NOT NULL,
    coins DECIMAL(20, 8) NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'delete')),
    created_by VARCHAR(255) DEFAULT 'system',
    user_id VARCHAR(255) NOT NULL DEFAULT 'default',
    source VARCHAR(50) DEFAULT 'manual',
    external_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_id, source);

-- Create composite index for common queries (user_id + status + date)
CREATE INDEX IF NOT EXISTS idx_transactions_user_status_date ON transactions(user_id, status, date DESC);

-- Create composite index for holdings queries (user_id + symbol + status)
CREATE INDEX IF NOT EXISTS idx_transactions_user_symbol_status ON transactions(user_id, symbol, status);

-- Enable Row Level Security (RLS) - optional but recommended
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own transactions
CREATE POLICY "Users can read their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid()::text = user_id OR user_id = 'default');

-- Create policy to allow users to insert their own transactions
CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid()::text = user_id OR user_id = 'default');

-- Create policy to allow users to update their own transactions
CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid()::text = user_id OR user_id = 'default');

-- Create policy to allow users to delete their own transactions
CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (auth.uid()::text = user_id OR user_id = 'default');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

