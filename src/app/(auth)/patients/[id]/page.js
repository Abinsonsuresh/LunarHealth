import { createServerSupabase } from "@/libs/supabase/supabaseServer"
import PatientDetails from "@/components/patient/patientDetails"

const PatientPage = async ({ params }) => {
  const { id } = await params

  const supabase = await createServerSupabase()
  const { data: patient, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-600">Error loading patient: {error.message}</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Patient not found</p>
      </div>
    )
  }

  // Fetch visits for this patient
  const { data: visits, error: visitsError } = await supabase
    .from("patient_visits")
    .select(
      "id, visited_at, condition, notes, diagnosis, treatment, prescriptions, doctor_id, created_at",
    )
    .eq("patient_id", id)
    .order("visited_at", { ascending: false })

  const visitsData = visitsError ? [] : visits || []

  // Fetch doctors with role "doctor" from profiles table
  const { data: doctors, error: doctorsError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "doctor")

  const doctorsData = doctorsError ? [] : doctors || []

  return (
    <div className="py-8">
      <PatientDetails
        patient={patient}
        visits={visitsData}
        doctors={doctorsData}
      />
    </div>
  )
}

export default PatientPage
