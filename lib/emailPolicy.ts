const RECRUITER_EMAIL_DOMAIN = 'bridgebeam.com';

export function isAllowedRecruiterEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return /^[^\s@]+@bridgebeam\.com$/i.test(normalizedEmail);
}

export function getRecruiterEmailPolicyMessage(): string {
  return `Recruiter accounts must use an @${RECRUITER_EMAIL_DOMAIN} email address.`;
}
