export const PASSWORD_STRENGTH = /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[ ~!@#$%^&*_\-+=`|\\(){}[\]:;"'<>,.?\/]){1,}).{8,}$/

// Added space character to special characters

// Microsoft standard: https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/password-must-meet-complexity-requirements

// The password contains characters from three of the following categories:
// Uppercase letters of European languages (A through Z, with diacritic marks, Greek and Cyrillic characters)
// Lowercase letters of European languages (a through z, sharp-s, with diacritic marks, Greek and Cyrillic characters)
// Base 10 digits (0 through 9)
// Non-alphanumeric characters (special characters): (~!@#$%^&*_-+=`|\(){}[]:;"'<>,.?/) Currency symbols such as the Euro or British Pound aren't counted as special characters for this policy setting.
// Any Unicode character that's categorized as an alphabetic character but isn't uppercase or lowercase. This group includes Unicode characters from Asian languages.