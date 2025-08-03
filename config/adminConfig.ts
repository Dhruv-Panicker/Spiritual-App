
// Admin email addresses with access to admin features
export const ADMIN_EMAILS = [
  'dhru.panicker@gmail.com',
  'dhruvandapaar@gmail.com'
];

// Check if a user email is an admin
export const isAdminUser = (email: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
