/**
 * Simulates fetching or creating patient data.
 * In a real app, this would make an API call to the backend.
 */
export const createMockPatient = () => {
  return {
    id: `PAT-${Math.floor(Math.random() * 10000)}`,
    name: "John Doe",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    contact: "+1 555-0123",
    medicalHistoryId: `HIST-${Math.floor(Math.random() * 5000)}`,
  }
}

/**
 * Generates a payload string for the QR code based on patient data.
 * This ensures consistency in what format the QR code contains.
 * @param {object} patient - The patient object.
 * @returns {string} - JSON stringified payload.
 */
export const generatePatientQRPayload = (patient) => {
  return JSON.stringify({
    type: "PATIENT_ID",
    id: patient.id,
    name: patient.name,
    timestamp: new Date().toISOString(),
  })
}
