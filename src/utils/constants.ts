export const UUID_VERSION = 4;
export const NAME_REGEX = /^[\u0027-\u0029\u002F-\u0039\u0040\u0061-\u007A\u00C0-\uFFFF ,.'\-_]+$/iu; // see regex.test.ts to understand the regex
export const SET_FILTER_NAME_REGEX = /^[\w\s()\-_,.|:'[\]]{1,200}$/iu; // see regex.test.ts to understand the regex
export const LINKEDIN_REGEX = /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/*/iu;
export const MAX_LENGTH_PER_ROLE = 100;
