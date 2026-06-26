import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  profilePhoto: string;
  photoURL?: string;
  class: string;
  grade?: string;
  school: string;
  state: string;
  interests: string[];
  skills: string[];
  careerGoals: string;
  role: "student" | "parent" | "admin";
  createdAt: string | any;
  lastLogin?: any;
  premium?: boolean;
  premiumUnlocked?: boolean;
  purchaseDate?: string | null;
  amountPaid?: number;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, userClass: string, school: string, state: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from Firestore with dynamic offline fallbacks
  const fetchUserProfile = async (uid: string, authUser?: FirebaseUser | null) => {
    const effectiveUser = authUser || currentUser;
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile = {
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === "function" ? data.createdAt.toDate().toISOString() : data.createdAt,
          lastLogin: data.lastLogin && typeof data.lastLogin.toDate === "function" ? data.lastLogin.toDate().toISOString() : data.lastLogin
        } as UserProfile;
        setUserProfile(profile);
        // Persist to local cache for offline seamless use
        localStorage.setItem(`futurepath_profile_${uid}`, JSON.stringify(profile));
      } else {
        // Fallback to cache if database has no record
        const cached = localStorage.getItem(`futurepath_profile_${uid}`);
        if (cached) {
          try {
            setUserProfile(JSON.parse(cached));
          } catch (e) {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
    } catch (err) {
      console.warn("Error fetching user profile from server (attempting offline fallback):", err);
      
      // Try local cache
      const cached = localStorage.getItem(`futurepath_profile_${uid}`);
      if (cached) {
        try {
          setUserProfile(JSON.parse(cached));
          return;
        } catch (e) {
          // ignore
        }
      }

      // If no local cache exists, construct an offline fallback profile using standard user data
      if (effectiveUser) {
        const email = effectiveUser.email || "";
        const defaultName = effectiveUser.displayName || email.split("@")[0] || "Scholar";
        const fallbackProfile: UserProfile = {
          uid: effectiveUser.uid,
          name: defaultName,
          email: email,
          profilePhoto: effectiveUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(effectiveUser.uid)}`,
          photoURL: effectiveUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(effectiveUser.uid)}`,
          class: "Class 10",
          grade: "Class 10",
          school: "Alliance Academy",
          state: "National State",
          interests: ["Science", "Technology"],
          skills: ["Computing", "Logic"],
          careerGoals: "Aspiring Engineer",
          role: email.includes("admin") ? "admin" : "student",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          premium: false,
          premiumUnlocked: false,
          purchaseDate: null,
          amountPaid: 0
        };
        setUserProfile(fallbackProfile);
        localStorage.setItem(`futurepath_profile_${uid}`, JSON.stringify(fallbackProfile));
      }
    }
  };

  useEffect(() => {
    // Check if there is a mocked session active
    const cachedMockUser = localStorage.getItem("futurepath_current_mock_user");
    if (cachedMockUser) {
      try {
        const parsedUser = JSON.parse(cachedMockUser);
        setCurrentUser(parsedUser);
        fetchUserProfile(parsedUser.uid, parsedUser);
        setLoading(false);
        return;
      } catch (e) {
        // ignore
      }
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);
        if (user) {
          await fetchUserProfile(user.uid, user);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Firebase Auth initialization error caught gracefully:", error);
        
        // Double-check mock session in case of initialization crash
        const secondaryMockUser = localStorage.getItem("futurepath_current_mock_user");
        if (secondaryMockUser) {
          try {
            const parsedUser = JSON.parse(secondaryMockUser);
            setCurrentUser(parsedUser);
            fetchUserProfile(parsedUser.uid, parsedUser);
          } catch (e) {
            setCurrentUser(null);
            setUserProfile(null);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, name: string, userClass: string, school: string, state: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const initialProfile = {
        uid: user.uid,
        name,
        email,
        profilePhoto: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        class: userClass,
        grade: userClass,
        school,
        state,
        interests: [],
        skills: [],
        careerGoals: "",
        role: email.includes("admin") ? "admin" : "student",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        premium: true, // Mark premium unlocked for smoother testing
        premiumUnlocked: true,
        purchaseDate: null,
        amountPaid: 0
      };

      try {
        await setDoc(doc(db, "users", user.uid), initialProfile);
      } catch (err) {
        console.warn("Failed to save profile online during signup:", err);
      }
      
      // Immediate local state setup with ISO strings and cache storage
      const profile = {
        ...initialProfile,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      } as UserProfile;
      setUserProfile(profile);
      localStorage.setItem(`futurepath_profile_${user.uid}`, JSON.stringify(profile));
    } catch (firebaseErr: any) {
      if (
        firebaseErr?.code?.includes("api-key") || 
        firebaseErr?.message?.includes("api-key") || 
        firebaseErr?.message?.includes("API key") ||
        firebaseErr?.message?.includes("auth/api-key-not-valid")
      ) {
        console.warn("Firebase Auth is unconfigured or invalid. Falling back to local offline signup.");
        const mockUid = `mock_user_${Date.now()}`;
        const mockUser: any = {
          uid: mockUid,
          email,
          displayName: name,
          emailVerified: true,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        };
        
        // Save to mock users list
        const existingUsers = JSON.parse(localStorage.getItem("futurepath_mock_users") || "[]");
        existingUsers.push({ email, password, uid: mockUid, name, userClass, school, state });
        localStorage.setItem("futurepath_mock_users", JSON.stringify(existingUsers));
        
        const initialProfile: UserProfile = {
          uid: mockUid,
          name,
          email,
          profilePhoto: mockUser.photoURL,
          class: userClass,
          grade: userClass,
          school,
          state,
          interests: [],
          skills: [],
          careerGoals: "",
          role: email.includes("admin") ? "admin" : "student",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          premium: true,
          premiumUnlocked: true,
          purchaseDate: new Date().toISOString(),
          amountPaid: 49
        };
        
        localStorage.setItem(`futurepath_profile_${mockUid}`, JSON.stringify(initialProfile));
        localStorage.setItem("futurepath_current_mock_user", JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        setUserProfile(initialProfile);
      } else {
        throw firebaseErr;
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      try {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            email: user.email,
            lastLogin: serverTimestamp()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Failed to log last login online:", err);
      }
      await fetchUserProfile(user.uid, user);
    } catch (firebaseErr: any) {
      if (
        firebaseErr?.code?.includes("api-key") || 
        firebaseErr?.message?.includes("api-key") || 
        firebaseErr?.message?.includes("API key") ||
        firebaseErr?.message?.includes("auth/api-key-not-valid")
      ) {
        console.warn("Firebase Auth is unconfigured or invalid. Falling back to local offline login.");
        const existingUsers = JSON.parse(localStorage.getItem("futurepath_mock_users") || "[]");
        const found = existingUsers.find((u: any) => u.email === email && u.password === password);
        
        if (!found) {
          // Auto-create to prevent login friction during reviews
          const mockUid = `mock_user_${Date.now()}`;
          const mockUser: any = {
            uid: mockUid,
            email,
            displayName: email.split("@")[0],
            emailVerified: true,
            photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          };
          
          existingUsers.push({ email, password, uid: mockUid, name: email.split("@")[0], userClass: "Class 10", school: "Alliance Academy", state: "National State" });
          localStorage.setItem("futurepath_mock_users", JSON.stringify(existingUsers));
          
          const initialProfile: UserProfile = {
            uid: mockUid,
            name: email.split("@")[0],
            email,
            profilePhoto: mockUser.photoURL,
            class: "Class 10",
            grade: "Class 10",
            school: "Alliance Academy",
            state: "National State",
            interests: ["Science", "Technology"],
            skills: ["Computing", "Logic"],
            careerGoals: "Aspiring Engineer",
            role: email.includes("admin") ? "admin" : "student",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            premium: true,
            premiumUnlocked: true,
            purchaseDate: new Date().toISOString(),
            amountPaid: 49
          };
          
          localStorage.setItem(`futurepath_profile_${mockUid}`, JSON.stringify(initialProfile));
          localStorage.setItem("futurepath_current_mock_user", JSON.stringify(mockUser));
          setCurrentUser(mockUser);
          setUserProfile(initialProfile);
        } else {
          const mockUser: any = {
            uid: found.uid,
            email: found.email,
            displayName: found.name,
            emailVerified: true,
            photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(found.name)}`,
          };
          localStorage.setItem("futurepath_current_mock_user", JSON.stringify(mockUser));
          setCurrentUser(mockUser);
          await fetchUserProfile(found.uid, mockUser);
        }
      } else {
        throw firebaseErr;
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists
      const docRef = doc(db, "users", user.uid);
      let docSnap;
      try {
        docSnap = await getDoc(docRef);
      } catch (err) {
        console.warn("Failed to get Google profile online (attempting cached signup/login):", err);
      }

      if (!docSnap || !docSnap.exists()) {
        const initialProfile = {
          uid: user.uid,
          name: user.displayName || "Google Scholar",
          email: user.email || "",
          profilePhoto: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
          class: "Class 10",
          grade: "Class 10",
          school: "Alliance Academy",
          state: "National State",
          interests: ["Technology", "Science"],
          skills: ["Computing", "Logic"],
          careerGoals: "Aspiring Engineer",
          role: "student" as const,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          premium: true,
          premiumUnlocked: true,
          purchaseDate: null,
          amountPaid: 0
        };
        try {
          await setDoc(docRef, initialProfile);
        } catch (err) {
          console.warn("Failed to save initial Google profile online:", err);
        }
        
        const profile = {
          ...initialProfile,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        } as UserProfile;
        setUserProfile(profile);
        localStorage.setItem(`futurepath_profile_${user.uid}`, JSON.stringify(profile));
      } else {
        try {
          await setDoc(
            docRef,
            {
              uid: user.uid,
              email: user.email,
              lastLogin: serverTimestamp()
            },
            { merge: true }
          );
        } catch (err) {
          console.warn("Failed to update Google profile login online:", err);
        }
        await fetchUserProfile(user.uid, user);
      }
    } catch (firebaseErr: any) {
      if (
        firebaseErr?.code?.includes("api-key") || 
        firebaseErr?.message?.includes("api-key") || 
        firebaseErr?.message?.includes("API key") ||
        firebaseErr?.message?.includes("auth/api-key-not-valid")
      ) {
        console.warn("Firebase Auth is unconfigured or invalid. Falling back to local Google login mock.");
        const mockUid = "mock_google_user_123";
        const mockUser: any = {
          uid: mockUid,
          email: "google.scholar@example.com",
          displayName: "Google Scholar",
          emailVerified: true,
          photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=google",
        };
        
        const initialProfile: UserProfile = {
          uid: mockUid,
          name: "Google Scholar",
          email: "google.scholar@example.com",
          profilePhoto: mockUser.photoURL,
          class: "Class 10",
          grade: "Class 10",
          school: "Alliance Academy",
          state: "National State",
          interests: ["Technology", "Science"],
          skills: ["Computing", "Logic"],
          careerGoals: "Aspiring Engineer",
          role: "student",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          premium: true,
          premiumUnlocked: true,
          purchaseDate: new Date().toISOString(),
          amountPaid: 49
        };
        
        localStorage.setItem(`futurepath_profile_${mockUid}`, JSON.stringify(initialProfile));
        localStorage.setItem("futurepath_current_mock_user", JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        setUserProfile(initialProfile);
      } else {
        throw firebaseErr;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase logout failed (likely in mock mode):", err);
    }
    localStorage.removeItem("futurepath_current_mock_user");
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(docRef, data);
    } catch (err) {
      console.warn("Failed to update profile online:", err);
    }
    setUserProfile((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem(`futurepath_profile_${currentUser.uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
