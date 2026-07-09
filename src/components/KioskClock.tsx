import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    LogIn,
    LogOut,
    Bell,
    X,
    Loader2,
    Fingerprint,
    Building2,
    AlertTriangle
} from 'lucide-react';
import { useKioskClock, useMatchFace, useVenueLocation } from '../hooks/useApi';
// Import the Liveness SDK
import { LivenessComponent } from 'pv-liveness-sdk';

// 1. Isolated SDK wrapper to guard against parent clock ticks re-rendering the SDK session
const StableLivenessWrapper: React.FC<{
    onSuccess: () => void;
}> = React.memo(({ onSuccess }) => {
    // Keep reference completely stable
    const handleStateChange = useCallback((state: any) => {
        console.log("Liveness State:", state);
    }, []);

    return (
        <LivenessComponent
            width={640}
            height={480}
            onSuccess={onSuccess}
            onStateChange={handleStateChange}
        />
    );
});
StableLivenessWrapper.displayName = 'StableLivenessWrapper';

// Notification Component
const Notification: React.FC<{
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    onClose?: () => void;
}> = ({ type, title, message, onClose }) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default: return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return 'bg-emerald-50 border-emerald-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-amber-50 border-amber-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className={`p-4 rounded-xl border ${getColors()} animate-in slide-in-from-right duration-300 relative`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{title}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const KioskClock: React.FC = () => {
    const theme = {
        primary: '#2596be',
        primaryLight: '#2596be15',
        primaryDark: '#1a7a9e',
        primaryGradient: 'linear-gradient(135deg, #2596be, #1a7a9e)'
    };

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isMountedRef = useRef(true);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }>>([]);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [showLivenessSDK, setShowLivenessSDK] = useState(false);
    const [pendingAction, setPendingAction] = useState<'in' | 'out' | null>(null);
    const [matchedStaff, setMatchedStaff] = useState<{ staff_id: string; full_name: string; score: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const navigate = useNavigate();
    const { data: venue, isLoading: loadingVenue } = useVenueLocation();
    const matchFaceMutation = useMatchFace();
    const clockMutation = useKioskClock();

    // Use mutable refs for data mutations to prevent breaking useCallback dependencies
    const contextRef = useRef({ matchedStaff, pendingAction, coords });
    useEffect(() => {
        contextRef.current = { matchedStaff, pendingAction, coords };
    }, [matchedStaff, pendingAction, coords]);

    // Update clock
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Initialize Camera and GPS (Runs only once on mount)
    useEffect(() => {
        isMountedRef.current = true;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
                    addNotification('info', 'Location Acquired', 'GPS coordinates locked successfully');
                },
                (error) => {
                    setStatusMsg(`Geolocation error: ${error.message}`);
                    addNotification('error', 'Location Error', error.message);
                }
            );
        }

        startCamera();

        // CLEANUP
        return () => {
            isMountedRef.current = false; // <-- Mark as unmounted

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, []);

    async function startCamera() {
        // Pre-emptively stop any existing stream (prevents double-streams in Strict Mode)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });

            // 🔥 THE ZOMBIE KILLER 🔥
            // If the user left the page while we were waiting for the camera to turn on,
            // immediately shut down the newly created stream and bail out.
            if (!isMountedRef.current) {
                mediaStream.getTracks().forEach(track => track.stop());
                return;
            }

            setStream(mediaStream);
            streamRef.current = mediaStream;

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setIsCameraReady(true);
                addNotification('success', 'Camera Ready', 'Webcam stream initialized successfully');
            }
        } catch (err) {
            console.error("Error accessing webcam: ", err);
            setStatusMsg("Camera access denied. Please verify permissions.");
            addNotification('error', 'Camera Access Denied', 'Please allow camera permissions');
        }
    }

    const stopCamera = () => {
        // Stop from state
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        // Stop from ref
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraReady(false);
    };

    const addNotification = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
        const id = Date.now().toString();
        setNotifications(prev => [{ id, type, title, message }, ...prev].slice(0, 20));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 8000);
    };

    const captureFrame = (): Promise<File> => {
        return new Promise((resolve, reject) => {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (!video || !canvas || !isCameraReady) {
                return reject(new Error("Camera stream is not fully ready"));
            }

            const context = canvas.getContext('2d');
            if (!context) return reject(new Error("Failed to resolve canvas context"));

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            context.setTransform(1, 0, 0, 1, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'kiosk-capture.jpg', { type: 'image/jpeg' });
                    resolve(file);
                } else {
                    reject(new Error("Conversion to image blob failed"));
                }
            }, 'image/jpeg', 0.95);
        });
    };

    const processAttendance = async (action: 'in' | 'out') => {
        if (!coords) {
            setStatusMsg('Waiting for precise GPS coordinates...');
            addNotification('warning', 'GPS Required', 'Waiting for location lock');
            return;
        }

        setIsProcessing(true);
        setStatusMsg('Capturing face snapshot...');
        addNotification('info', 'Processing', 'Capturing face snapshot...');

        try {
            const capturedImage = await captureFrame();

            setStatusMsg('Analyzing identity match...');
            addNotification('info', 'Identity Match', 'Analyzing facial recognition...');

            const matchRes = await matchFaceMutation.mutateAsync({ image: capturedImage });

            setMatchedStaff({
                staff_id: matchRes.staff_id,
                full_name: matchRes.full_name || 'Staff',
                score: matchRes.score
            });
            setPendingAction(action);

            stopCamera();
            setShowLivenessSDK(true);

            setStatusMsg(`Identity verified: ${matchRes.full_name || 'Staff'}. Please perform the liveness test.`);
            addNotification('success', 'Identity Verified', `Welcome ${matchRes.full_name || 'Staff'}! Please complete liveness check.`);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.detail || 'Verification failure. Please try again or contact your manager.';
            setStatusMsg(msg);
            addNotification('error', 'Verification Failed', msg);
            setIsProcessing(false);
        }
    };

    const latestSuccessLogicRef = useRef<() => Promise<void>>(null);

    useEffect(() => {
        latestSuccessLogicRef.current = async () => {
            if (!matchedStaff || !pendingAction || !coords) return;

            setStatusMsg('Liveness verified! Finalizing attendance punch...');
            addNotification('info', 'Liveness Passed', 'Reporting punch event...');

            try {
                // Safely use clockMutation directly
                const clockRes = await clockMutation.mutateAsync({
                    staff_id: matchedStaff.staff_id,
                    action: pendingAction,
                    lat: coords.lat,
                    lng: coords.lng,
                    liveness_passed: true,
                    face_match_score: matchedStaff.score
                });

                const timeStr = new Date(clockRes.time).toLocaleTimeString();
                setStatusMsg(`Success! Attendance logged (${clockRes.action}) at ${timeStr}`);
                addNotification(
                    'success',
                    `Clocked ${pendingAction === 'in' ? 'In' : 'Out'}`,
                    `Attendance recorded at ${timeStr}`
                );
            } catch (error: any) {
                console.error(error);
                const msg = error.response?.data?.detail || 'Failed to submit log structure.';
                setStatusMsg(msg);
                addNotification('error', 'Punch Error', msg);
            } finally {
                resetKioskFlow();
            }
        };
    }); // <-- Notice: No dependency array. It runs every render silently.

    const handleLivenessSuccess = useCallback(async () => {
        // Wait 1.5 seconds
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (latestSuccessLogicRef.current) {
            await latestSuccessLogicRef.current();
        }
    }, []); // Stable reference

    const resetKioskFlow = () => {
        startCamera();
        setShowLivenessSDK(false);
        setMatchedStaff(null);
        setPendingAction(null);
        setIsProcessing(false);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="flex h-screen">
                <div className={`flex-1 transition-all duration-300 ${showNotificationPanel ? 'lg:pr-[420px]' : 'pr-0'}`}>
                    <div className="h-full flex flex-col p-6 lg:p-8 overflow-y-auto">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-6 h-6" style={{ color: theme.primary }} />
                                    Attendance Kiosk
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    {formatDate(currentTime)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${(isCameraReady || showLivenessSDK) ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                    <span className="text-slate-600">{(isCameraReady || showLivenessSDK) ? 'Online' : 'Offline'}</span>
                                </div>
                                <button
                                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                                    className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <Bell className="w-5 h-5 text-slate-500" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500">Location</p>
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : 'Acquiring...'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500">Venue</p>
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {loadingVenue ? 'Loading...' : venue ? venue.name || 'Verified ✓' : 'Out of bounds'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500">Current Time</p>
                                    <p className="text-sm font-medium text-slate-900 font-mono">
                                        {formatTime(currentTime)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Camera and Controls */}
                        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                            <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-slate-200 min-h-[400px] lg:min-h-0 flex items-center justify-center">

                                {showLivenessSDK ? (
                                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
                                        {/* Render the safe component isolated from clock rerenders */}
                                        <StableLivenessWrapper onSuccess={handleLivenessSuccess} />
                                        <button
                                            onClick={resetKioskFlow}
                                            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors z-10"
                                        >
                                            <X className="w-3.5 h-3.5" /> Cancel Verification
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                            style={{ transform: 'scaleX(-1)' }}
                                        />
                                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                                        {!isCameraReady && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white">
                                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-[#2596be] mb-4" />
                                                <p className="text-sm font-medium">Initializing camera...</p>
                                                <p className="text-xs text-slate-400 mt-1">Please allow camera permissions</p>
                                            </div>
                                        )}

                                        {isCameraReady && (
                                            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>Live Lens Ready</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Controls Panel */}
                            <div className="lg:w-[280px] flex flex-col gap-4">
                                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex-1">
                                    <div className="text-center mb-4">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                                            {showLivenessSDK ? 'Identity Verification' : 'Attendance Action'}
                                        </p>
                                    </div>

                                    {!showLivenessSDK ? (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => processAttendance('in')}
                                                disabled={!isCameraReady || !coords || isProcessing}
                                                className="w-full py-4 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                                style={{
                                                    background: `linear-gradient(135deg, #059669, #047857)`,
                                                    boxShadow: `0 4px 16px #05966944`
                                                }}
                                            >
                                                <LogIn className="w-5 h-5" />
                                                <span className="text-lg font-bold">CLOCK IN</span>
                                            </button>

                                            <button
                                                onClick={() => processAttendance('out')}
                                                disabled={!isCameraReady || !coords || isProcessing}
                                                className="w-full py-4 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                                style={{
                                                    background: `linear-gradient(135deg, #dc2626, #b91c1c)`,
                                                    boxShadow: `0 4px 16px #dc262644`
                                                }}
                                            >
                                                <LogOut className="w-5 h-5" />
                                                <span className="text-lg font-bold">CLOCK OUT</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                                            <p className="text-xs font-semibold text-emerald-800 uppercase">Matched Subject</p>
                                            <p className="text-sm font-bold text-slate-800 mt-1">{matchedStaff?.full_name}</p>
                                            <p className="text-xs text-slate-500 mt-2">Follow the SDK prompts on screen to complete clock-{pendingAction}.</p>
                                        </div>
                                    )}

                                    {/* Status Message */}
                                    {statusMsg && (
                                        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                            <p className="text-sm text-slate-700 text-center">{statusMsg}</p>
                                        </div>
                                    )}

                                    {/* Loading Indicator */}
                                    {(isProcessing || clockMutation.isPending) && (
                                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate('/enroll')}
                                    className="py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Fingerprint className="w-4 h-4" />
                                    Staff Enrollment Portal
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Panel */}
                {showNotificationPanel && (
                    <div className="fixed right-0 top-0 h-full w-[400px] bg-white/95 backdrop-blur-sm border-l border-slate-200 shadow-2xl z-30 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-slate-700" />
                                <h3 className="font-bold text-slate-900">Notifications</h3>
                                {notifications.length > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => setNotifications([])}
                                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowNotificationPanel(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No notifications</p>
                                    <p className="text-sm text-slate-400 mt-1">Activity will appear here</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <Notification
                                        key={notification.id}
                                        type={notification.type}
                                        title={notification.title}
                                        message={notification.message}
                                        onClose={() => {
                                            setNotifications(prev => prev.filter(n => n.id !== notification.id));
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slide-in-from-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-right {
          animation-name: slide-in-from-right;
        }
        .duration-300 { animation-duration: 300ms; }
      `}</style>
        </div>
    );
};