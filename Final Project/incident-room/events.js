// Presentation-only incident messages. Scenario timing and canonical story come from challenge.json.
// The fictional employees and notices below are illustrative, not extra quiz questions.
export const EVENTS = [
  {
    icon: 'mail', heading: 'New Email', timestamp: 'Mon 16:40',
    initials: 'SJ', sender: 'Sam Jenkins', role: 'Project Support Officer',
    subject: 'I opened an unexpected message',
    paragraphs: [
      'Hi team,',
      'I clicked a link in an email that appeared to come from IT. It said I needed to review a new security policy.',
      'My laptop is acting strangely now. Can you help?',
      'Thanks,', 'Sam',
    ],
    attachment: 'Security_Policy_Update.pdf',
    description: 'An employee has clicked a convincing phishing message. The incident is now underway.',
  },
  {
    icon: 'pulse', heading: 'Network Activity', timestamp: 'Tue 02:00',
    initials: 'SO', sender: 'Security Operations', role: 'Night-shift monitoring',
    subject: 'Possible internal network discovery',
    paragraphs: [
      'Team,',
      'A workstation is communicating with several internal systems during the night.',
      'We need to understand what is happening and what evidence our security tools can provide.',
      'Security Operations',
    ],
    description: 'The attacker is looking for valuable systems while most colleagues are offline.',
  },
  {
    icon: 'phone', heading: 'Suspicious Call', timestamp: 'Tue 03:30',
    initials: 'ND', sender: 'Night Desk', role: 'Work-order support',
    subject: 'Someone claiming to be IT needs an MFA code',
    paragraphs: [
      'Urgent update,',
      'A caller says they work in IT and need a sign-in code to fix an account issue.',
      'The caller sounds convincing, but we have not independently verified who they are.',
      'Night Desk',
    ],
    description: 'The attacker has remote control and is attempting to persuade someone to help them gain more access.',
  },
  {
    icon: 'lock', heading: 'Critical Alert', timestamp: 'Tue 06:30',
    initials: 'IR', sender: 'Incident Response', role: 'Business recovery',
    subject: 'Files unavailable — ransom demand displayed',
    paragraphs: [
      'Critical incident,',
      'Several important business files are encrypted. A ransom demand has appeared on screen.',
      'Our priorities are to protect people, preserve evidence and coordinate a safe recovery.',
      'Incident Response',
    ],
    description: 'Files have been encrypted. The team must explain its recovery capability and lessons learned.',
  },
];
