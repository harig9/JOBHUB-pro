import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore, googleProvider } from '../lib/firebase.js';
import { User } from '../types/index.js';
import { useToast } from '../components/Toast.js';
import { googleDriveService } from '../services/googleDriveService.js';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId?: string) => Promise<void>;
  verifyPhoneOtp: (otp: string, fullName?: string) => Promise<void>;
  resendPhoneOtp: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  isDriveConnected: boolean;
  connectGoogleDrive: () => Promise<string>;
  disconnectGoogleDrive: () => void;
  otpSent: boolean;
  otpCountdown: number;
  phoneTarget: string;
  authError: string | null;
  clearAuthError: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';
  openAuthModal: (mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_FALLBACK_USER: User = {
  id: 'usr_demo_01',
  email: 'alex.morgan@example.com',
  fullName: 'Alex Morgan',
  headline: 'Staff Full-Stack & Distributed Systems Architect',
  targetRole: 'Senior Full Stack Engineer / Solutions Architect',
  yearsExperience: 8,
  phone: '+91 98765 43210',
  location: 'San Francisco, CA (Open to Remote)',
  linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
  githubUrl: 'https://github.com/alexmorgan-code',
  portfolioUrl: 'https://alexmorgan.tech',
  createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Phone OTP state
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [phoneTarget, setPhoneTarget] = useState('');
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Google Drive Connection State
  const [isDriveConnected, setIsDriveConnected] = useState(googleDriveService.isConnected());

  useEffect(() => {
    return googleDriveService.subscribe((conn) => {
      setIsDriveConnected(conn);
    });
  }, []);

  const connectGoogleDrive = useCallback(async () => {
    try {
      const token = await googleDriveService.connectDrive(auth);
      showToast('Google Drive connected! You can now sync resumes and browse files.', 'success');
      return token;
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was dismissed.');
      }
      const msg = err.message || 'Google Drive connection failed.';
      showToast(msg, 'error');
      throw err;
    }
  }, [showToast]);

  const disconnectGoogleDrive = useCallback(() => {
    googleDriveService.disconnect();
    showToast('Google Drive disconnected', 'info');
  }, [showToast]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const openAuthModal = useCallback((mode: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
    setOtpSent(false);
    setConfirmationResult(null);
  }, []);

  // Countdown timer for Phone OTP resend
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Sync / Load User Profile from Firestore
  const fetchOrCreateProfile = async (fbUser: FirebaseUser, defaultFullName?: string): Promise<User> => {
    const userDocRef = doc(firestore, 'users', fbUser.uid);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as User;
        setUserProfile(data);
        return data;
      }
    } catch (err) {
      console.warn('Firestore profile read fallback:', err);
    }

    // Create new profile in Firestore
    const newProfile: User = {
      id: fbUser.uid,
      email: fbUser.email || '',
      phone: fbUser.phoneNumber || '',
      fullName:
        fbUser.displayName ||
        defaultFullName ||
        (fbUser.email ? fbUser.email.split('@')[0] : 'JobHub Member'),
      headline: 'AI Career Suite Member',
      targetRole: 'Full Stack Engineer',
      yearsExperience: 3,
      location: 'Remote / Hybrid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(userDocRef, newProfile);
    } catch (err) {
      console.warn('Firestore profile write notice:', err);
    }

    setUserProfile(newProfile);
    return newProfile;
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setCurrentUser(fbUser);
        await fetchOrCreateProfile(fbUser);
      } else {
        setCurrentUser(null);
        googleDriveService.disconnect();
        // Retain or load fallback profile if not logged in
        setUserProfile(DEMO_FALLBACK_USER);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Google OAuth
  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        googleDriveService.setAccessToken(credential.accessToken);
      }
      const profile = await fetchOrCreateProfile(result.user);
      showToast(`Welcome back, ${profile.fullName}!`, 'success');
      closeAuthModal();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User voluntarily dismissed popup
        return;
      }
      if (err.code === 'auth/account-exists-with-different-credential') {
        setAuthError('An account with this email already exists under a different sign-in method. Please sign in with your password or phone OTP.');
        return;
      }
      console.error('Google Sign-in Error:', err);
      setAuthError(err.message || 'Google authentication failed. Please try again.');
    }
  };

  // 2. Email & Password Registration
  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateFirebaseProfile(userCredential.user, { displayName: fullName.trim() });

      try {
        await sendEmailVerification(userCredential.user);
        showToast('Verification email sent! Please check your inbox.', 'info');
      } catch (e) {
        console.warn('Email verification send notice:', e);
      }

      const profile = await fetchOrCreateProfile(userCredential.user, fullName.trim());
      showToast(`Welcome to JobHub Pro, ${profile.fullName}!`, 'success');
      closeAuthModal();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password must be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else {
        setAuthError(err.message || 'Failed to create account. Please check your details.');
      }
      throw err;
    }
  };

  // 3. Email & Password Login
  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await fetchOrCreateProfile(userCredential.user);
      showToast(`Welcome back, ${profile.fullName}!`, 'success');
      closeAuthModal();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password. Please verify your credentials or use Forgot Password.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Too many unsuccessful attempts. Access temporarily restricted for security. Please try again shortly.');
      } else {
        setAuthError(err.message || 'Login failed. Please check your credentials.');
      }
      throw err;
    }
  };

  // 4. Phone Number OTP Verification Setup
  const initRecaptchaVerifier = (containerId = 'recaptcha-verifier-container') => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {}
      recaptchaVerifierRef.current = null;
    }

    try {
      const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setAuthError('reCAPTCHA expired. Please request OTP again.');
        },
      });
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.warn('reCAPTCHA verifier initialization notice:', err);
      return null;
    }
  };

  const sendPhoneOtp = async (phoneNumber: string, containerId = 'recaptcha-verifier-container') => {
    setAuthError(null);
    try {
      const verifier = initRecaptchaVerifier(containerId);
      if (!verifier) {
        throw new Error('Verification service initialization error. Please reload the page.');
      }

      setPhoneTarget(phoneNumber);
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setOtpSent(true);
      setOtpCountdown(60); // 60 seconds rate-limit countdown
      showToast(`SMS OTP sent to ${phoneNumber}!`, 'success');
    } catch (err: any) {
      console.error('Phone OTP error:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setAuthError('Invalid phone number format. Include country code (e.g. +91 9876543210).');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('SMS quota limit reached or too many requests. Please wait before retrying.');
      } else if (err.code === 'auth/quota-exceeded') {
        setAuthError('SMS service quota reached. Please use Google or Email login in the meantime.');
      } else {
        setAuthError(err.message || 'Failed to dispatch SMS OTP. Please check the number.');
      }
      throw err;
    }
  };

  const resendPhoneOtp = async () => {
    if (otpCountdown > 0 || !phoneTarget) return;
    await sendPhoneOtp(phoneTarget);
  };

  const verifyPhoneOtp = async (otp: string, fullName?: string) => {
    setAuthError(null);
    if (!confirmationResult) {
      setAuthError('No active OTP request found. Please request a new code.');
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp.trim());
      if (fullName && fullName.trim()) {
        try {
          await updateFirebaseProfile(result.user, { displayName: fullName.trim() });
        } catch {}
      }
      const profile = await fetchOrCreateProfile(result.user, fullName);
      showToast(`Phone verified! Welcome ${profile.fullName}!`, 'success');
      closeAuthModal();
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setAuthError('Incorrect 6-digit OTP code. Please double-check the code sent to your phone.');
      } else if (err.code === 'auth/code-expired') {
        setAuthError('The OTP code has expired. Please click "Resend Code".');
      } else {
        setAuthError(err.message || 'Failed to verify OTP. Please try again.');
      }
      throw err;
    }
  };

  // 5. Password Reset
  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast('Password reset link sent! Check your inbox.', 'success');
      setAuthModalMode('login');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setAuthError('No account registered with this email address.');
      } else {
        setAuthError(err.message || 'Failed to send password reset email.');
      }
      throw err;
    }
  };

  // 6. Sign Out
  const logout = async () => {
    try {
      googleDriveService.disconnect();
      await signOut(auth);
      showToast('Logged out of JobHub Pro successfully', 'info');
      setUserProfile(DEMO_FALLBACK_USER);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // 7. Update User Profile
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!userProfile) return;
    const merged: User = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
    setUserProfile(merged);

    if (currentUser) {
      try {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, updates);
      } catch (err) {
        console.warn('Profile sync to Firestore notice:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        resendPhoneOtp,
        resetPassword,
        logout,
        updateUserProfile,
        isDriveConnected,
        connectGoogleDrive,
        disconnectGoogleDrive,
        otpSent,
        otpCountdown,
        phoneTarget,
        authError,
        clearAuthError,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="recaptcha-verifier-container" className="hidden" />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
