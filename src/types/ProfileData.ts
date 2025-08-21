export interface ProfileData {
  profilePhoto?: string;
  FullName: string;
  Email: string;
  MobileNumber: string; // Display as string in UI, stored as array in DB
  AlternativeNumber: string;
  Gender: string;
  Age: string;
  DateOfBirth: string;
  Country: string;
  State: string;
  City: string;
  Height: string;
  Weight: string;
  BloodGroup: string;
  ChronicDiseases: string[];
  Allergies: string[];
}
