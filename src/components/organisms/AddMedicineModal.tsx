'use client';

import React, { useState } from 'react';
import { Typography, Icon, BackButton, UniversalHeader } from '../atoms';
import { Medicine, pillReminderHelpers } from '../../services/apiServices';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedicines: (medicines: Medicine[]) => void;
  loading?: boolean;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onAddMedicines,
  loading = false
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([pillReminderHelpers.createDefaultMedicine()]);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddMedicine = () => {
    const newMedicine = pillReminderHelpers.createDefaultMedicine();
    setMedicines([...medicines, newMedicine]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const updatedMedicines = [...medicines];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      // Safely spread only when the parent value is an object; otherwise default to {}
      const currentParentValue = (updatedMedicines[index] as any)[parent];
      const safeParentObject =
        currentParentValue && typeof currentParentValue === 'object' ? currentParentValue : {};

      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [parent]: {
          ...(safeParentObject as Record<string, any>),
          [child]: value
        }
      };
    } else {
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value
      };
    }
    setMedicines(updatedMedicines);
  };

  const handleTimingChange = (medicineIndex: number, timingKey: string, field: string, value: string) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[medicineIndex] = {
      ...updatedMedicines[medicineIndex],
      timings: {
        ...updatedMedicines[medicineIndex].timings,
        [timingKey]: {
          ...updatedMedicines[medicineIndex].timings[timingKey],
          [field]: value
        }
      }
    };
    setMedicines(updatedMedicines);
  };

  const handleAddTiming = (medicineIndex: number) => {
    const timingKeys = Object.keys(medicines[medicineIndex].timings);
    const nextTiming = timingKeys.length === 0 ? 'morning' : 
                      timingKeys.length === 1 ? 'afternoon' : 
                      timingKeys.length === 2 ? 'evening' : `timing_${timingKeys.length + 1}`;
    
    handleTimingChange(medicineIndex, nextTiming, 'intake', '1');
    handleTimingChange(medicineIndex, nextTiming, 'time', '12:00');
  };

  const handleSubmit = () => {
    setErrors([]);
    
    // Validate all medicines
    const allErrors: string[] = [];
    medicines.forEach((medicine, index) => {
      const validation = pillReminderHelpers.validateMedicine(medicine);
      if (!validation.isValid) {
        allErrors.push(`Medicine ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    onAddMedicines(medicines);
  };

  const handleCancel = () => {
    setMedicines([pillReminderHelpers.createDefaultMedicine()]);
    setErrors([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
        {/* Header with Back Arrow */}
        <div className="bg-gradient-to-r from-[#0E3293] to-[#1a4bb8] rounded-t-3xl">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center flex-1">
              {/* Back Arrow */}
              <BackButton
                onClick={handleCancel}
                variant="white"
                className="mr-4"
              />

              <div className="flex items-center">
                {/* Medicine Icon */}
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
                  <Icon name="pill" size="medium" color="white" />
                </div>

                <div>
                  <Typography variant="h5" className="font-bold text-white">
                    Add New Medicine
                  </Typography>
                  <Typography variant="body2" className="text-blue-100 text-sm">
                    Set up your medication schedule and reminders
                  </Typography>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon name="close" size="medium" color="white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-8 space-y-8">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5">
                <div className="flex items-start">
                  <Icon name="alert" size="small" color="#ef4444" className="mt-0.5 mr-3" />
                  <div>
                    <Typography variant="body2" className="text-red-800 font-semibold mb-2">
                      Please fix the following errors:
                    </Typography>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-red-700 text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          {/* Medicines List */}
          {medicines.map((medicine, medicineIndex) => (
            <div key={medicine.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-6 border border-gray-200 shadow-sm">
              {/* Medicine Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#0E3293]/10 rounded-full flex items-center justify-center">
                    <Icon name="pill" size="medium" color="#0E3293" />
                  </div>
                  <div>
                    <Typography variant="h6" className="font-bold text-[#0E3293]">
                      Medicine {medicineIndex + 1}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Configure your medication details
                    </Typography>
                  </div>
                </div>
                {medicines.length > 1 && (
                  <button
                    onClick={() => handleRemoveMedicine(medicineIndex)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Icon name="trash" size="small" color="#ef4444" />
                  </button>
                )}
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-xl p-5 space-y-4">
                <Typography variant="body1" className="font-semibold text-gray-800 mb-3">
                  📋 Basic Information
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(medicineIndex, 'name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                      placeholder="e.g., Paracetamol"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medicine Type
                    </label>
                    <select
                      value={medicine.type}
                      onChange={(e) => handleMedicineChange(medicineIndex, 'type', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                    >
                      <option value="Tablet">💊 Tablet</option>
                      <option value="Pill">💊 Pill</option>
                      <option value="Capsule">💊 Capsule</option>
                      <option value="Syrup">🥤 Syrup</option>
                      <option value="Suspension">🥤 Suspension</option>
                      <option value="Injection">💉 Injection</option>
                      <option value="Ointment">🧴 Ointment</option>
                      <option value="Lozenge">🍬 Lozenge</option>
                      <option value="Suppository">💊 Suppository</option>
                      <option value="Other">❓ Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dose */}
              <div className="bg-white rounded-xl p-5 space-y-4">
                <Typography variant="body1" className="font-semibold text-gray-800 mb-3">
                  💊 Dosage Information
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dose Amount *
                    </label>
                    <input
                      type="text"
                      value={medicine.dose.value}
                      onChange={(e) => handleMedicineChange(medicineIndex, 'dose.value', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={medicine.dose.unit}
                      onChange={(e) => handleMedicineChange(medicineIndex, 'dose.unit', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                    >
                      <option value="tablet">tablet(s)</option>
                      <option value="capsule">capsule(s)</option>
                      <option value="ml">ml</option>
                      <option value="mg">mg</option>
                      <option value="drops">drop(s)</option>
                      <option value="tsp">teaspoon(s)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Timing Schedule */}
              <div className="bg-white rounded-xl p-5 space-y-4">
                <Typography variant="body1" className="font-semibold text-gray-800 mb-3">
                  ⏰ Daily Schedule
                </Typography>

                {/* Time Slots */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'morning', label: 'Morning', icon: '🌅', defaultTime: '08:00' },
                    { key: 'afternoon', label: 'Afternoon', icon: '☀️', defaultTime: '14:00' },
                    { key: 'evening', label: 'Evening', icon: '🌆', defaultTime: '20:00' },
                    { key: 'bedtime', label: 'Bedtime', icon: '🌙', defaultTime: '22:00' }
                  ].map((timeSlot) => {
                    const isSelected = medicine.timings[timeSlot.key];
                    return (
                      <div key={timeSlot.key} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newTimings = { ...medicine.timings };
                            if (isSelected) {
                              delete newTimings[timeSlot.key];
                            } else {
                              newTimings[timeSlot.key] = {
                                intake: medicine.dose.value,
                                time: timeSlot.defaultTime,
                                customIntake: ''
                              };
                            }
                            handleMedicineChange(medicineIndex, 'timings', newTimings);
                          }}
                          className={`w-full p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[#0E3293] bg-[#0E3293]/10 text-[#0E3293] shadow-md'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#0E3293]/30 hover:bg-[#0E3293]/5'
                          }`}
                        >
                          <div className="text-lg mb-1">{timeSlot.icon}</div>
                          <div className="text-xs font-medium">{timeSlot.label}</div>
                        </button>

                        {isSelected && (
                          <input
                            type="time"
                            value={medicine.timings[timeSlot.key]?.time || timeSlot.defaultTime}
                            onChange={(e) => {
                              const newTimings = { ...medicine.timings };
                              newTimings[timeSlot.key] = {
                                ...newTimings[timeSlot.key],
                                time: e.target.value
                              };
                              handleMedicineChange(medicineIndex, 'timings', newTimings);
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Meal Timing */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meal Timing
                  </label>
                  <select
                    value={medicine.timingType}
                    onChange={(e) => handleMedicineChange(medicineIndex, 'timingType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                  >
                    <option value="before">🍽️ Before Meal</option>
                    <option value="after">🍽️ After Meal</option>
                    <option value="with">🍽️ With Meal</option>
                    <option value="bedtime">🌙 At Bedtime</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-white rounded-xl p-5 space-y-4">
                <Typography variant="body1" className="font-semibold text-gray-800 mb-3">
                  📅 Treatment Duration
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration *
                    </label>
                    <input
                      type="text"
                      value={medicine.duration.value}
                      onChange={(e) => handleMedicineChange(medicineIndex, 'duration.value', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                      placeholder="7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={medicine.duration.unit}
                      onChange={(e) => handleMedicineChange(medicineIndex, 'duration.unit', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                    >
                      <option value="days">📅 Days</option>
                      <option value="weeks">📅 Weeks</option>
                      <option value="months">📅 Months</option>
                      <option value="sos">🆘 SOS (As needed)</option>
                      <option value="weekbased">📅 Week-based</option>
                      <option value="alternative">🔄 Alternative days</option>
                      <option value="onemonthonetime">📅 Once a month</option>
                      <option value="weekwise">📅 Week-wise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={medicine.duration.startDate}
                      onChange={(e) => handleMedicineChange(medicineIndex, 'duration.startDate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0E3293] focus:border-[#0E3293] bg-white text-gray-900 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Medicine Button */}
          <button
            onClick={handleAddMedicine}
            className="w-full py-4 border-2 border-dashed border-[#0E3293]/30 rounded-2xl text-[#0E3293] hover:border-[#0E3293] hover:bg-[#0E3293]/5 transition-all font-medium flex items-center justify-center"
          >
            <Icon name="plus" size="small" color="#0E3293" className="mr-2" />
            Add Another Medicine
          </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex items-center justify-between">
          <Typography variant="body2" className="text-gray-600">
            {medicines.length} medicine{medicines.length > 1 ? 's' : ''} configured
          </Typography>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-[#0E3293] to-[#1a4bb8] text-white rounded-xl hover:from-[#0c2a7a] hover:to-[#0E3293] transition-all disabled:opacity-50 font-medium shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Adding medicines... Please wait</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Icon name="plus" size="small" color="white" className="mr-2" />
                  <span>Add {medicines.length} Medicine{medicines.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineModal;
