// Profession, subcategory, and specialization data for onboarding popup

export const professions = [
  'Student',
  'Teacher',
  'Doctor',
  'Engineer',
  'Lawyer',
  'Business',
  'Other',
];

export function getSubcategories(profession: string): string[] {
  switch (profession) {
    case 'Student':
      return ['School', 'College', 'University'];
    case 'Teacher':
      return ['Primary', 'Secondary', 'College', 'University'];
    case 'Doctor':
      return ['General', 'Specialist'];
    case 'Engineer':
      return ['Software', 'Civil', 'Mechanical', 'Electrical'];
    case 'Lawyer':
      return ['Corporate', 'Criminal', 'Civil'];
    case 'Business':
      return ['Startup', 'SME', 'Enterprise'];
    default:
      return ['General'];
  }
}

export function getSpecializations(subcategory: string): string[] {
  switch (subcategory) {
    case 'School':
      return ['Science', 'Commerce', 'Arts'];
    case 'College':
      return ['Science', 'Commerce', 'Arts', 'Engineering'];
    case 'University':
      return ['Undergraduate', 'Postgraduate', 'PhD'];
    case 'Primary':
      return ['Math', 'Science', 'Language'];
    case 'Secondary':
      return ['Math', 'Science', 'Social Studies'];
    case 'Software':
      return ['Frontend', 'Backend', 'Fullstack'];
    case 'Civil':
      return ['Structural', 'Environmental'];
    case 'Mechanical':
      return ['Automotive', 'Aerospace'];
    case 'Electrical':
      return ['Power', 'Electronics'];
    case 'General':
      return ['General'];
    default:
      return ['General'];
  }
}
