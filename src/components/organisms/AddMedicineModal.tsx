import React, { useState } from 'react';
import { Plus, X, Trash2, Upload, FileText, Clock, Calendar, Pill, AlertCircle, ChevronDown, Camera, Sun, Moon, Sunset } from 'lucide-react';
import type { Medicine } from '../../services/apiServices';

// Types
type MealTiming = 'before' | 'after' | 'bedtime' | 'custom';

interface Dose {
  value: string;
  unit: string;
}

interface Duration {
  value: string;
  unit: string;
  startDate: string; // yyyy-mm-dd
}

interface TimingEntry {
  intake: string;
  time: string; // HH:MM
  customIntake?: string;
}

type Timings = Record<string, TimingEntry>;

type MedicineItem = Medicine;

type AddMedicinesHandler = (medicines: Medicine[], prescriptionFile: File | null) => void;

interface AddMedicineModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAddMedicines?: AddMedicinesHandler;
  loading?: boolean;
}

const defaultOnAdd: AddMedicinesHandler = () => {};

// Helper function to calculate end date based on start date and duration
const calculateEndDate = (startDate: string, durationValue: string, durationUnit: string): string => {
  const start = new Date(startDate);
  const duration = parseInt(durationValue) || 0;
  
  if (durationUnit === 'sos') {
    return startDate; // For SOS, end date is same as start date
  }
  
  let endDate = new Date(start);
  
  switch (durationUnit) {
    case 'days':
      endDate.setDate(start.getDate() + duration);
      break;
    case 'weeks':
      endDate.setDate(start.getDate() + (duration * 7));
      break;
    case 'months':
      endDate.setMonth(start.getMonth() + duration);
      break;
    default:
      endDate.setDate(start.getDate() + duration);
  }
  
  return endDate.toISOString().split('T')[0];
};

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen = true,
  onClose = () => {},
  onAddMedicines = defaultOnAdd,
  loading = false
}) => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([{
    id: '1',
    name: '',
    type: 'Tablet',
    dose: { value: '1', unit: 'tablet' },
    timings: {},
    timingType: 'before',
    duration: { value: '7', unit: 'days', startDate: new Date().toISOString().split('T')[0], endDate: calculateEndDate(new Date().toISOString().split('T')[0], '7', 'days') }
  }]);
  const [errors, setErrors] = useState<string[]>([]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  const handleAddMedicine = () => {
    const startDate = new Date().toISOString().split('T')[0];
    const newMedicine: MedicineItem = {
      id: Date.now().toString(),
      name: '',
      type: 'Tablet',
      dose: { value: '1', unit: 'tablet' },
      timings: {},
      timingType: 'before',
      duration: { value: '7', unit: 'days', startDate, endDate: calculateEndDate(startDate, '7', 'days') }
    };
    setMedicines([...medicines, newMedicine]);
    setActiveTab(medicines.length);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
      if (activeTab >= medicines.length - 1) {
        setActiveTab(Math.max(0, medicines.length - 2));
      }
    }
  };

  /**
   * Returns the provided value if it's a non-array object; otherwise returns an empty object.
   * Used to safely merge nested fields without losing sibling properties.
   */
  const getSafeParentObject = (value: unknown) => {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : {};
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const updatedMedicines = [...medicines];
    if (field.includes('.')) {
      const [parent, child] = field.split('.') as [keyof Pick<MedicineItem, 'dose' | 'duration' | 'timings'>, string];
      const currentParentValue = updatedMedicines[index][parent];
      const safeParentObject = getSafeParentObject(currentParentValue);

      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [parent]: { ...safeParentObject, [child]: value }
      };

      // Auto-calculate end date when duration or start date changes
      if (parent === 'duration' && (child === 'value' || child === 'unit' || child === 'startDate')) {
        const medicine = updatedMedicines[index];
        const duration = medicine.duration as any;
        const startDate = child === 'startDate' ? value : duration.startDate;
        const durationValue = child === 'value' ? value : duration.value;
        const durationUnit = child === 'unit' ? value : duration.unit;
        
        updatedMedicines[index] = {
          ...updatedMedicines[index],
          duration: {
            ...duration,
            endDate: calculateEndDate(startDate, durationValue, durationUnit)
          }
        };
      }
    } else {
      updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    }
    setMedicines(updatedMedicines);
  };

  const timeSlots = [
    { key: 'morning', label: 'Morning', icon: 'Sun', defaultTime: '08:00', color: 'from-[#0e3293] to-[#1a4bb8]' },
    { key: 'afternoon', label: 'Afternoon', icon: 'Sun', defaultTime: '14:00', color: 'from-[#0e3293] to-[#2563eb]' },
    { key: 'evening', label: 'Evening', icon: 'Sunset', defaultTime: '20:00', color: 'from-[#1a4bb8] to-[#0e3293]' },
    { key: 'bedtime', label: 'Bedtime', icon: 'Moon', defaultTime: '22:00', color: 'from-[#2563eb] to-[#0e3293]' }
  ];

  const currentMedicine = medicines[activeTab] || medicines[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] sm:max-w-4xl sm:rounded-3xl overflow-hidden shadow-2xl add-medicine-modal">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0e3293] to-[#1a4bb8] px-4 sm:px-6 py-6 sm:py-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                  <Pill className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Add Medicine</h1>
                  <p className="text-white/80 text-sm">Set up your medication reminders</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine Tabs - Mobile Optimized */}
        {medicines.length > 1 && (
          <div className="bg-gray-50 px-4 py-3 border-b overflow-x-auto">
            <div className="flex space-x-2">
              {medicines.map((medicine, index) => (
                <button
                  key={medicine.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === index
                      ? 'bg-[#0e3293] text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Medicine {index + 1}
                  {medicine.name && `: ${medicine.name.slice(0, 10)}${medicine.name.length > 10 ? '...' : ''}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="h-[calc(100dvh-200px)] sm:h-auto sm:max-h-[60vh] overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-in slide-in-from-top duration-300">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Please fix these errors:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Prescription Upload */}
            <div className="bg-gradient-to-br from-[#0e3293]/5 to-[#0e3293]/10 rounded-2xl p-5 border border-[#0e3293]/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#0e3293]/10 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#0e3293]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Prescription</h3>
                  <p className="text-sm text-gray-600">Optional - Attach for reference</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#0e3293]/30 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-colors">
                  <div className="flex flex-col items-center">
                    <Camera className="w-8 h-8 text-[#0e3293] mb-2" />
                    <p className="text-sm font-medium text-[#0e3293]">Take photo or upload file</p>
                    <p className="text-xs text-gray-500">PNG, JPG or PDF</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                
                {prescriptionFile && (
                  <div className="flex items-center justify-between bg-white rounded-xl p-3 border">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-[#0e3293]" />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {prescriptionFile.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setPrescriptionFile(null)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Medicine Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-900 to-gray-700 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Medicine {activeTab + 1}</h3>
                    <p className="text-gray-300 text-sm">Configure details</p>
                  </div>
                </div>
                {medicines.length > 1 && (
                  <button
                    onClick={() => handleRemoveMedicine(activeTab)}
                    className="text-red-400 hover:text-red-300 hover:bg-white/10 p-2 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="p-5 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={currentMedicine.name}
                      onChange={(e) => handleMedicineChange(activeTab, 'name', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#0e3293] focus:ring-2 focus:ring-[#0e3293]/20 transition-all duration-200 text-gray-900"
                      placeholder="e.g., Paracetamol"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Type
                    </label>
                    <div className="relative">
                      <select
                        value={currentMedicine.type}
                        onChange={(e) => handleMedicineChange(activeTab, 'type', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#0e3293] focus:ring-2 focus:ring-[#0e3293]/20 transition-all duration-200 text-gray-900 appearance-none"
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Pill">Pill</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Injection">Injection</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Dosage */}
                <div className="bg-gradient-to-br from-[#0e3293]/5 to-[#0e3293]/10 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Pill className="w-4 h-4 text-[#0e3293] mr-2" />
                    Dosage
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                      <input
                        type="text"
                        value={currentMedicine.dose.value}
                        onChange={(e) => handleMedicineChange(activeTab, 'dose.value', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20 transition-colors"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={currentMedicine.dose.unit}
                        onChange={(e) => handleMedicineChange(activeTab, 'dose.unit', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20 transition-colors"
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

                {/* Time Slots */}
                <div className="bg-gradient-to-br from-[#0e3293]/5 to-[#0e3293]/10 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Clock className="w-4 h-4 text-[#0e3293] mr-2" />
                    Daily Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((timeSlot) => {
                      const isSelected = currentMedicine.timings[timeSlot.key];
                      return (
                        <div key={timeSlot.key} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newTimings = { ...currentMedicine.timings };
                              if (isSelected) {
                                delete newTimings[timeSlot.key];
                              } else {
                                newTimings[timeSlot.key] = {
                                  intake: currentMedicine.dose.value,
                                  time: timeSlot.defaultTime
                                };
                              }
                              handleMedicineChange(activeTab, 'timings', newTimings);
                            }}
                            className={`w-full p-3 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              isSelected
                                ? `border-transparent bg-gradient-to-br ${timeSlot.color} text-white shadow-lg`
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-center">
                              {timeSlot.icon === 'Sun' && <Sun className="w-6 h-6" />}
                              {timeSlot.icon === 'Moon' && <Moon className="w-6 h-6" />}
                              {timeSlot.icon === 'Sunset' && <Sunset className="w-6 h-6" />}
                            </div>
                            <div className="text-xs font-medium">{timeSlot.label}</div>
                          </button>

                          {isSelected && (
                            <input
                              type="time"
                              value={currentMedicine.timings[timeSlot.key]?.time || timeSlot.defaultTime}
                              onChange={(e) => {
                                const newTimings = { ...currentMedicine.timings };
                                newTimings[timeSlot.key] = {
                                  ...newTimings[timeSlot.key],
                                  time: e.target.value
                                };
                                handleMedicineChange(activeTab, 'timings', newTimings);
                              }}
                              className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Meal Timing */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Timing</label>
                    <select
                      value={currentMedicine.timingType}
                      onChange={(e) => handleMedicineChange(activeTab, 'timingType', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20 transition-colors"
                    >
                      <option value="before">Before Meal</option>
                      <option value="after">After Meal</option>
                      <option value="with">With Meal</option>
                      <option value="bedtime">At Bedtime</option>
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-gradient-to-br from-[#0e3293]/5 to-[#0e3293]/10 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 text-[#0e3293] mr-2" />
                    Treatment Duration
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                      <input
                        type="text"
                        value={currentMedicine.duration.value}
                        onChange={(e) => handleMedicineChange(activeTab, 'duration.value', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20 transition-colors"
                        placeholder="7"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={currentMedicine.duration.unit}
                        onChange={(e) => handleMedicineChange(activeTab, 'duration.unit', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20 transition-colors"
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="sos">SOS (As needed)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={currentMedicine.duration.startDate}
                          onChange={(e) => handleMedicineChange(activeTab, 'duration.startDate', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={currentMedicine.duration.endDate}
                          onChange={(e) => handleMedicineChange(activeTab, 'duration.endDate', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:border-[#0e3293] focus:ring-1 focus:ring-[#0e3293]/20 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Medicine Button */}
            <button
              onClick={handleAddMedicine}
              className="w-full py-4 border-2 border-dashed border-[#0e3293]/30 rounded-2xl text-[#0e3293] hover:border-[#0e3293] hover:bg-[#0e3293]/5 transition-all duration-200 font-medium flex items-center justify-center group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Add Another Medicine
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{medicines.length}</span> medicine{medicines.length > 1 ? 's' : ''} configured
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => onAddMedicines(medicines, prescriptionFile)}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-[#0e3293] to-[#1a4bb8] text-white rounded-xl hover:from-[#0c2a7a] hover:to-[#0e3293] transition-all duration-200 disabled:opacity-50 font-medium shadow-lg flex items-center group"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Add Medicine{medicines.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineModal;