import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, Video, MessageSquare, Calendar, Clock,
  CheckCircle2, AlertTriangle, ShieldCheck, Star, X,
  ArrowRight, CheckSquare, Square, Loader2, Sprout
} from "lucide-react";
import {
  fetchVerifiedExpertsAPI,
  requestConsultationAPI,
  type ExpertProfileItem
} from "../services/api";

interface ExpertConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop?: string;
  scanId?: string;
  imageUrl?: string;
  suspectedDisease?: string;
  district?: string;
  onBookingSuccess?: (consultationData: any) => void;
}

export const ExpertConsultationBookingModal: React.FC<ExpertConsultationBookingModalProps> = ({
  isOpen,
  onClose,
  crop = "Tomato",
  scanId,
  imageUrl,
  suspectedDisease,
  district = "Coimbatore",
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [experts, setExperts] = useState<ExpertProfileItem[]>([]);
  const [isLoadingExperts, setIsLoadingExperts] = useState(true);

  // Form states
  const [problemDescription, setProblemDescription] = useState(
    suspectedDisease
      ? `Visual symptoms observed on foliage: ${suspectedDisease} in ${district}. Requesting clinical verification and certified treatment guidance.`
      : `Observed abnormal foliage discoloration and lesions on ${crop} plot. Seeking expert agronomic guidance.`
  );
  const [consultationType, setConsultationType] = useState<"CHAT" | "VIDEO">("VIDEO");
  const [selectedExpertId, setSelectedExpertId] = useState<string>("exp-01");
  const [selectedSlot, setSelectedSlot] = useState<string>("Today 02:30 PM - 03:00 PM");
  const [farmerConsent, setFarmerConsent] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookedConsultation, setBookedConsultation] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setBookedConsultation(null);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setIsLoadingExperts(true);
    fetchVerifiedExpertsAPI({ crop }).then((list) => {
      if (isMounted) {
        setExperts(list || []);
        if (list && list.length > 0) {
          setSelectedExpertId(list[0].id);
          if (list[0].available_slots && list[0].available_slots.length > 0) {
            setSelectedSlot(list[0].available_slots[0]);
          }
        }
        setIsLoadingExperts(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, crop]);

  if (!isOpen) return null;

  const currentSelectedExpert = experts.find((e) => e.id === selectedExpertId) || experts[0];

  const handleSubmitBooking = async () => {
    if (!farmerConsent) {
      setErrorMessage("Please grant consent to share your crop leaf photograph and field location with the expert.");
      return;
    }

    if (!problemDescription.trim()) {
      setErrorMessage("Please describe the leaf symptoms or field observations.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await requestConsultationAPI({
        expert_id: selectedExpertId,
        scan_id: scanId,
        crop,
        problem_description: problemDescription.trim(),
        consultation_type: consultationType,
        scheduled_time: selectedSlot,
        shared_image_url: imageUrl,
        farmer_consent: farmerConsent
      });

      setBookedConsultation(res.data);
      if (onBookingSuccess) {
        onBookingSuccess(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to schedule appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[var(--shadow-lift)] border border-line"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-forest tracking-tight">
                Consult an Agricultural Expert
              </h3>
              <p className="text-xs text-ink-2">
                Certified TNAU & ICAR Public Extension Consultation Desk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-ink-3 hover:text-ink hover:bg-paper cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-5">
          {bookedConsultation ? (
            /* Successful Booking View */
            <div className="p-6 bg-emerald-50/90 rounded-2xl border border-emerald-300 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-emerald-950">
                  Consultation Confirmed!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-900 font-medium">
                  Your appointment with <strong>{bookedConsultation.expert_name}</strong> is scheduled.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs text-left space-y-2 text-ink">
                <div className="flex items-center justify-between">
                  <span className="text-ink-2">Format:</span>
                  <span className="font-bold text-forest">
                    {bookedConsultation.consultation_type === "VIDEO" ? "📹 Live Video Consultation (WebRTC)" : "💬 Real-Time Chat"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-2">Appointment Slot:</span>
                  <span className="font-bold text-forest">{bookedConsultation.scheduled_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-2">Crop & District:</span>
                  <span className="font-bold text-forest">{bookedConsultation.crop} • {district}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-2">Secure Room ID:</span>
                  <span className="font-mono text-[11px] text-ink-3">{bookedConsultation.room_id}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onBookingSuccess) onBookingSuccess(bookedConsultation);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-forest hover:bg-forest-hover text-cream font-bold text-xs sm:text-sm rounded-full transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Enter Consultation Room Now</span>
                  <ArrowRight className="w-4 h-4 text-lime" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 bg-paper hover:bg-cream-card text-ink font-bold text-xs rounded-full border border-line cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-red-900 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step Navigation Pill */}
              <div className="flex items-center justify-between text-xs font-bold text-ink-2 px-1">
                <span className={step === 1 ? "text-forest underline" : ""}>1. Describe & Format</span>
                <span>→</span>
                <span className={step === 2 ? "text-forest underline" : ""}>2. Select Expert</span>
                <span>→</span>
                <span className={step === 3 ? "text-forest underline" : ""}>3. Slot & Confirm</span>
              </div>

              {/* STEP 1: Problem Description, Image Preview & Format */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Shared Leaf Image Preview */}
                  {imageUrl && (
                    <div className="p-3 bg-paper rounded-2xl border border-line flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Crop leaf scan"
                        className="w-16 h-16 rounded-xl object-cover border border-line shrink-0"
                      />
                      <div className="space-y-0.5 text-xs">
                        <span className="font-bold text-forest flex items-center gap-1">
                          <Sprout className="w-3.5 h-3.5 text-forest" />
                          <span>{crop} Leaf Observation</span>
                        </span>
                        <p className="text-ink-2">
                          AI Suspected: <strong>{suspectedDisease || "Foliar assessment"}</strong>
                        </p>
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold inline-block">
                          ✓ Image attached to consultation
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Problem Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-forest uppercase tracking-wider">
                      Describe the Crop Symptoms or Questions
                    </label>
                    <textarea
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      rows={3}
                      placeholder="Describe affected area, canopy symptoms, watering schedule, or recent weather..."
                      className="w-full bg-paper border border-line rounded-xl p-3 text-xs sm:text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-forest"
                    />
                  </div>

                  {/* Format Selection (Chat vs Video) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-forest uppercase tracking-wider">
                      Choose Consultation Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setConsultationType("VIDEO")}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                          consultationType === "VIDEO"
                            ? "bg-forest/10 border-forest text-forest shadow-xs ring-2 ring-forest/20"
                            : "bg-paper border-line text-ink-2 hover:bg-cream-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Video className="w-5 h-5 text-forest" />
                          <span className="text-[10px] font-black uppercase tracking-wider bg-lime/40 text-forest px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm block text-forest">
                            Live Video Consultation
                          </span>
                          <span className="text-[11px] text-ink-2 leading-tight block mt-0.5">
                            Real-time WebRTC audio/video call with camera leaf inspection.
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsultationType("CHAT")}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2 ${
                          consultationType === "CHAT"
                            ? "bg-forest/10 border-forest text-forest shadow-xs ring-2 ring-forest/20"
                            : "bg-paper border-line text-ink-2 hover:bg-cream-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <MessageSquare className="w-5 h-5 text-forest" />
                          <span className="text-[10px] font-black uppercase tracking-wider bg-paper text-ink-3 px-2 py-0.5 rounded border border-line">
                            Low Bandwidth
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm block text-forest">
                            Real-Time Chat & Images
                          </span>
                          <span className="text-[11px] text-ink-2 leading-tight block mt-0.5">
                            Encrypted messaging, follow-up photo sharing & prescription.
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Explicit Farmer Consent Checkbox */}
                  <div className="p-3.5 bg-paper rounded-xl border border-line space-y-2">
                    <button
                      type="button"
                      onClick={() => setFarmerConsent(!farmerConsent)}
                      className="flex items-start gap-2.5 text-left text-xs text-ink cursor-pointer select-none"
                    >
                      {farmerConsent ? (
                        <CheckSquare className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-5 h-5 text-ink-3 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed">
                        I give consent to share my crop leaf photograph, GPS district ({district}), and diagnosis history with certified university agricultural officers.
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Select Agricultural Expert */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-ink-2 font-bold">
                    <span>Verified University & Extension Experts</span>
                    <span className="text-forest">TNAU / ICAR Certified</span>
                  </div>

                  {isLoadingExperts ? (
                    <div className="p-10 text-center text-xs text-ink-2">Loading verified expert profiles...</div>
                  ) : (
                    <div className="space-y-3">
                      {experts.map((exp) => (
                        <div
                          key={exp.id}
                          onClick={() => {
                            setSelectedExpertId(exp.id);
                            if (exp.available_slots && exp.available_slots.length > 0) {
                              setSelectedSlot(exp.available_slots[0]);
                            }
                          }}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            selectedExpertId === exp.id
                              ? "bg-forest/5 border-forest ring-2 ring-forest/20 shadow-xs"
                              : "bg-paper border-line hover:border-forest/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={exp.avatar_url || "https://images.unsplash.com/photo-1594824813571-638f0263613b?auto=format&fit=crop&w=300&q=80"}
                              alt={exp.name}
                              className="w-14 h-14 rounded-full object-cover border border-line shrink-0"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-sm text-forest">{exp.name}</h4>
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.2 rounded-full border border-emerald-300">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                                  <span>{exp.verification_status}</span>
                                </span>
                              </div>
                              <p className="text-xs text-ink font-medium">{exp.designation}</p>
                              <p className="text-[11px] text-ink-2">{exp.institution}</p>
                              <p className="text-[10px] text-ink-3">
                                🎓 {exp.qualifications} • {exp.experience_years} yrs exp • Languages: {exp.languages.join(", ")}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{exp.rating}</span>
                                <span className="text-[10px] text-ink-3">({exp.consultation_count} clinics)</span>
                              </div>
                              <span className="text-[11px] text-forest font-bold">
                                {selectedExpertId === exp.id ? "✓ Selected" : "Select →"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Select Available Slot & Summary */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Selected Expert Header */}
                  {currentSelectedExpert && (
                    <div className="p-4 bg-forest/5 rounded-2xl border border-forest/20 flex items-center gap-3">
                      <img
                        src={currentSelectedExpert.avatar_url || "https://images.unsplash.com/photo-1594824813571-638f0263613b?auto=format&fit=crop&w=300&q=80"}
                        alt={currentSelectedExpert.name}
                        className="w-12 h-12 rounded-full object-cover border border-line"
                      />
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-forest text-sm block">{currentSelectedExpert.name}</span>
                        <p className="text-ink-2">{currentSelectedExpert.designation}</p>
                        <p className="text-[11px] text-ink-3">{currentSelectedExpert.institution}</p>
                      </div>
                    </div>
                  )}

                  {/* Available Appointment Slots */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-forest" />
                      <span>Select an Available Appointment Slot</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(currentSelectedExpert?.available_slots || [
                        "Today 02:30 PM - 03:00 PM",
                        "Today 04:00 PM - 04:30 PM",
                        "Tomorrow 10:30 AM - 11:00 AM"
                      ]).map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                            selectedSlot === slot
                              ? "bg-forest text-lime border-forest shadow-xs"
                              : "bg-paper border-line text-ink hover:bg-cream-card"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{slot}</span>
                          </span>
                          {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-lime" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Final Review Card */}
                  <div className="p-4 bg-paper rounded-2xl border border-line text-xs space-y-2 text-ink">
                    <span className="font-bold text-forest block uppercase tracking-wider text-[11px]">
                      Consultation Booking Summary
                    </span>
                    <div className="space-y-1 text-ink-2">
                      <p>• <strong>Format:</strong> {consultationType === "VIDEO" ? "📹 Live Video Consultation (WebRTC)" : "💬 Real-Time Chat"}</p>
                      <p>• <strong>Crop & District:</strong> {crop} • {district}</p>
                      <p>• <strong>Observation:</strong> {problemDescription}</p>
                      <p>• <strong>Free Public Extension:</strong> Certified public agricultural university advisory.</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!bookedConsultation && (
          <div className="pt-4 border-t border-line flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 bg-paper text-ink font-bold text-xs rounded-full hover:bg-cream-card cursor-pointer"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-ink-3 hover:text-ink text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-6 py-2.5 bg-forest hover:bg-forest-hover text-cream font-bold text-xs sm:text-sm rounded-full transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-lime" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-forest hover:bg-forest-hover text-cream font-bold text-xs sm:text-sm rounded-full transition shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-lime" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-lime" />
                )}
                <span>Confirm Appointment</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
