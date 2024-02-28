import { redirect } from "@remix-run/node";

// This is the entry point for the app.
// In this loader we could look at any data they user is coming in with and route accordingly.
// Maybe they're coming from Zebra or other referral source and we already have their name, DOB, etc.
export const loader = () => redirect(`/name`);
