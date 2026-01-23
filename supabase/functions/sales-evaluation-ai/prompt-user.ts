export const STUDENT_USER_PROMPT = (cvText: string, candidateName?: string | null) => `
Student Name (if known): ${candidateName || "Not specified"}

Below is the student's resume/CV text. Use ONLY this information for your analysis:

${cvText}
`;

export const SALES_USER_PROMPT = (cvText: string, candidateName?: string | null) => `
Candidate Name (if known): ${candidateName || "Not specified"}

Below is the candidate's resume/CV text. Use ONLY this information for your scoring and analysis:

${cvText}
`;

