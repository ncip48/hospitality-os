// KioskEnroll.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Shield } from 'lucide-react';
import { useEnrollKiosk, useStaffList } from '../hooks/useApi';
import { THEME } from '../constants';
import { KioskHeader } from '../components/Kiosk/KioskHeader';
import { EnrollmentStats } from '../components/Kiosk/EnrollmentStats';
import { StaffSelect } from '../components/Kiosk/StaffSelect';
import { StaffPreview } from '../components/Kiosk/StaffPreview';
import { ImageUploader } from '../components/Kiosk/ImageUploader';
import { EnrollmentActions } from '../components/Kiosk/EnrollmentActions';

export const KioskEnroll: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [selectedStaffPk, setSelectedStaffPk] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // API Hooks
    const { data: staffData, isLoading: loadingStaff, isError: staffError, refetch } = useStaffList();
    const enrollMutation = useEnrollKiosk();

    // Derived Data
    const selectedStaff = staffData?.results?.find((s: any) => String(s.pk) === selectedStaffPk);
    const totalStaff = staffData?.results?.length || 0;
    const enrolledStaff = staffData?.results?.filter((s: any) => s.is_enrolled)?.length || 0;

    // Handlers
    const handleFileSelect = (file: File) => {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleEnroll = async () => {
        if (!selectedStaffPk || !imageFile) return;

        try {
            await enrollMutation.mutateAsync({
                staff_id: selectedStaffPk,
                consent_given_at: new Date().toISOString(),
                image: imageFile,
            });
            setTimeout(() => navigate('/kiosk'), 1500);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.detail || 'Enrollment rejected. Ensure elevated Manager privileges.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5"
                    style={{ background: `radial-gradient(circle, ${THEME.primary} 0%, transparent 70%)`, animation: 'float 20s ease-in-out infinite' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5"
                    style={{ background: `radial-gradient(circle, ${THEME.primary} 0%, transparent 70%)`, animation: 'float 25s ease-in-out infinite reverse' }} />
            </div>

            <div className="mx-auto relative">
                <KioskHeader
                    title="Staff Enrollment Setup"
                    subtitle="Link biometric details to staff profiles for kiosk access"
                    onBack={() => navigate('/kiosk')}
                />

                <EnrollmentStats totalStaff={totalStaff} enrolledStaff={enrolledStaff} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" /> Select Staff Member
                            </h3>

                            <StaffSelect
                                staffData={staffData?.results || []}
                                selectedPk={selectedStaffPk}
                                isLoading={loadingStaff}
                                isError={staffError}
                                onChange={setSelectedStaffPk}
                                onRefresh={refetch}
                            />

                            <StaffPreview
                                staff={selectedStaff}
                                onClear={() => setSelectedStaffPk('')}
                            />
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Shield className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                <span>Biometric data is encrypted and securely stored</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-slate-400" /> Upload Face Photo
                            </h3>
                            <ImageUploader
                                previewUrl={imagePreview}
                                fileName={imageFile?.name}
                                onFileSelect={handleFileSelect}
                                onRemove={handleRemoveImage}
                            />
                        </div>

                        <EnrollmentActions
                            isReady={!!(selectedStaff && imageFile)}
                            isPending={enrollMutation.isPending}
                            staffName={selectedStaff?.full_name}
                            onEnroll={handleEnroll}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0); }
                    33% { transform: translate(30px, -30px); }
                    66% { transform: translate(-20px, 20px); }
                }
                .animate-in { animation-fill-mode: both; }
                .fade-in { animation: fade-in 300ms ease-in-out; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};