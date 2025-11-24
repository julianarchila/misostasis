-- Migration: add maps_url column to place
-- Run this migration against your development database to allow storing Google Maps links

ALTER TABLE "place" ADD COLUMN IF NOT EXISTS "maps_url" text;
