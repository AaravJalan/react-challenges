export const validateTerm = (term: string): string => {
  const validTerms = ['Fall', 'Winter', 'Spring', 'Summer'];
  if (!validTerms.includes(term.trim())) {
    return 'Term must be Fall, Winter, Spring, or Summer';
  }
  return '';
};

export const validateNumber = (number: string): string => {
  if (!/^\d{3}(?:-[0-9A-Za-z])?$/.test(number.trim())) {
    return 'Must be 3 digits (e.g., 213) or 5 characters with section (e.g., 213-2)';
  }
  return '';
};

export const validateTitle = (title: string): string => {
  if (title.trim().length < 2) {
    return 'Course title must be at least two characters';
  }
  return '';
};

export const validateMeets = (meets: string): string => {
  if (!meets.trim()) return ''; // Empty string is legal per spec

  const match = meets.trim().match(/^([A-Za-z]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!match) {
    return 'Must contain days and start-end, e.g., MWF 12:00-13:20';
  }

  const [, daysStr, startStr, endStr] = match;
  const days = daysStr.match(/Tu|Th|Sa|Su|M|W|F/g) || [];

  if (days.join('') !== daysStr || days.length === 0) {
    return 'Must contain valid days (e.g. MWF, TuTh)';
  }

  if (new Set(days).size !== days.length) {
    return 'Days must not repeat';
  }

  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);

  if (sh > 23 || sm > 59 || eh > 23 || em > 59) {
    return 'Times must be valid 24h clock values (0:00-23:59)';
  }

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  if (startMin >= endMin) {
    return 'Start time must be strictly before end time';
  }

  return '';
};
