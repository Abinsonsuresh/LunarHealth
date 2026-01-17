import { createServerSupabase } from "@/libs/supabase/supabaseServer"
import PatientDetails from "@/components/patient/patientDetails"

async function PatientPage({ params }) {
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

  return (
    <div className="py-8">
      <PatientDetails patient={patient} />
    </div>
  )
}

export default PatientPage
