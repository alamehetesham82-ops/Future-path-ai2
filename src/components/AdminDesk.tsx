import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { 
  collection, getDocs, setDoc, doc, updateDoc, deleteDoc, addDoc 
} from "firebase/firestore";
import { 
  ShieldAlert, ShieldCheck, Users, Plus, Trash2, CheckCircle2, XCircle, 
  Loader2, Award, Calendar, BookOpen, GraduationCap, Compass, FileText 
} from "lucide-react";

export const AdminDesk: React.FC = () => {
  const { userProfile } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form selections
  const [adminTab, setAdminTab] = useState<"users" | "add-data">("users");

  // Forms for Seeding / adding Custom data
  const [newItemType, setNewItemType] = useState<"college" | "career" | "scholarship">("college");
  
  // College form states
  const [colName, setColName] = useState("");
  const [colLoc, setColLoc] = useState("");
  const [colCourses, setColCourses] = useState("");
  const [colElig, setColEligibility] = useState("");
  const [colPlac, setColPlacement] = useState("");

  // Career form states
  const [carName, setCarName] = useState("");
  const [carSalary, setCarSalary] = useState("");
  const [carSkills, setCarSkills] = useState("");
  const [carDesc, setCarDesc] = useState("");

  // Scholarship form states
  const [schTitle, setSchTitle] = useState("");
  const [schElig, setSchElig] = useState("");
  const [schAmt, setSchAmt] = useState("");
  const [schLink, setSchLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const uSnap = await getDocs(collection(db, "users"));
      setUsersList(uSnap.docs.map(doc => doc.data()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateDataNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (newItemType === "college") {
        const docId = `col_${Date.now()}`;
        await setDoc(doc(db, "colleges", docId), {
          id: docId,
          name: colName,
          location: colLoc,
          courses: colCourses.split(",").map(c => c.trim()),
          eligibility: colElig,
          placement: colPlac,
          rating: 4.8
        });
        setColName("");
        setColLoc("");
        setColCourses("");
        setColEligibility("");
        setColPlacement("");
        alert("Ecosystem college parameter logged successfully!");
      } else if (newItemType === "career") {
        const docId = `car_${Date.now()}`;
        await setDoc(doc(db, "careers", docId), {
          id: docId,
          title: carName,
          salary: carSalary,
          skills: carSkills.split(",").map(s => s.trim()),
          demand: "High",
          description: carDesc
        });
        setCarName("");
        setCarSalary("");
        setCarSkills("");
        setCarDesc("");
        alert("Ecosystem career parameter logged successfully!");
      } else if (newItemType === "scholarship") {
        const docId = `sch_${Date.now()}`;
        await setDoc(doc(db, "scholarships", docId), {
          id: docId,
          title: schTitle,
          eligibility: schElig,
          amount: schAmt,
          deadline: "2026-12-31",
          category: "Academic",
          applicationLink: schLink || "https://cbse.gov.in"
        });
        setSchTitle("");
        setSchElig("");
        setSchAmt("");
        setSchLink("");
        alert("Ecosystem scholarship parameter logged successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500 border border-red-505/20 animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">Admin Desk</h2>
          <p className="text-xs text-slate-400 font-mono">HIGH-CLEARANCE EXECUTIVE DIRECTORY. ADMINISTRATOR CONTROLLER.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setAdminTab("users")}
          className={`py-1.5 px-4 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
            adminTab === "users" 
              ? "bg-red-500 text-slate-950 font-bold border-red-500" 
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Manage Users ({usersList.length})
        </button>

        <button
          onClick={() => setAdminTab("add-data")}
          className={`py-1.5 px-4 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
            adminTab === "add-data" 
              ? "bg-red-500 text-slate-950 font-bold border-red-500" 
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Add System Parameters
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">Polling secure admin directory...</span>
        </div>
      ) : (
        <div className="animate-fadeIn">
          
          {/* User management tab */}
          {adminTab === "users" && (
            <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Registered System Nodes</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950/60 font-mono text-slate-500 text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Participant Name</th>
                      <th className="py-2.5 px-3">Ecosystem Email</th>
                      <th className="py-2.5 px-3">Class level</th>
                      <th className="py-2.5 px-3">Clearance Access</th>
                      <th className="py-2.5 px-3 text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {usersList.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-900/35 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{u.email}</td>
                        <td className="py-3 px-3">{u.class || "N/A"}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-red-550/10 text-red-400 border border-red-500/20 rounded font-mono font-bold text-[10px]">
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500 text-[10px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Prior Logs"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add custom parameters tab */}
          {adminTab === "add-data" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Selector left */}
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Configuration targets</span>
                <div className="flex flex-col space-y-1.5 font-mono text-xs">
                  <button
                    onClick={() => setNewItemType("college")}
                    className={`p-2.5 text-left rounded-lg transition-colors ${
                      newItemType === "college" ? "bg-red-500/10 text-red-400 border-l-2 border-red-500" : "hover:bg-slate-950 text-slate-400"
                    }`}
                  >
                    University Node
                  </button>
                  <button
                    onClick={() => setNewItemType("career")}
                    className={`p-2.5 text-left rounded-lg transition-colors ${
                      newItemType === "career" ? "bg-red-500/10 text-red-400 border-l-2 border-red-500" : "hover:bg-slate-950 text-slate-400"
                    }`}
                  >
                    Career Pathway Node
                  </button>
                  <button
                    onClick={() => setNewItemType("scholarship")}
                    className={`p-2.5 text-left rounded-lg transition-colors ${
                      newItemType === "scholarship" ? "bg-red-500/10 text-red-400 border-l-2 border-red-500" : "hover:bg-slate-950 text-slate-400"
                    }`}
                  >
                    Scholarship Node
                  </button>
                </div>
              </div>

              {/* Form entries right */}
              <div className="lg:col-span-2 p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
                <form onSubmit={handleCreateDataNode} className="space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-350">
                    Drafting CRISTAL_{newItemType.toUpperCase()} Node
                  </h4>

                  {newItemType === "college" && (
                    <div className="space-y-3 text-xs animate-fadeIn">
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">University Name</label>
                        <input type="text" value={colName} onChange={e => setColName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="e.g. IIT Madras" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Location</label>
                          <input type="text" value={colLoc} onChange={e => setColLoc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="e.g. Chennai, India" required />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Eligibility Criteria</label>
                          <input type="text" value={colElig} onChange={e => setColEligibility(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="JEE cutoff ranks..." required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Available Courses (Comma listed)</label>
                        <input type="text" value={colCourses} onChange={e => setColCourses(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="B.Tech Computer Science, B.Tech AI" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Placement Rates / Packages Info</label>
                        <input type="text" value={colPlac} onChange={e => setColPlacement(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="95% placement index" required />
                      </div>
                    </div>
                  )}

                  {newItemType === "career" && (
                    <div className="space-y-3 text-xs animate-fadeIn">
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Career Title</label>
                        <input type="text" value={carName} onChange={e => setCarName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="e.g. Cybersecurity Auditor" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Estimated Compensation (Salary bounds)</label>
                        <input type="text" value={carSalary} onChange={e => setCarSalary(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="₹12 Lakhs - ₹30 Lakhs" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Prerequisite Core Skills (Comma listed)</label>
                        <input type="text" value={carSkills} onChange={e => setCarSkills(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="Auditing, Cryptography, Linux" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Description Profile</label>
                        <textarea value={carDesc} onChange={e => setCarDesc(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="Conduct comprehensive network sweeps..." required />
                      </div>
                    </div>
                  )}

                  {newItemType === "scholarship" && (
                    <div className="space-y-3 text-xs animate-fadeIn">
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Scholarship Title</label>
                        <input type="text" value={schTitle} onChange={e => setSchTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="e.g. state merit scholarship" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Stipend Amount</label>
                          <input type="text" value={schAmt} onChange={e => setSchAmt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="₹15,000 / Year" required />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Application Hub Link</label>
                          <input type="text" value={schLink} onChange={e => setSchLink(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="https://..." required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-400 font-mono mb-1">Eligibility Criteria</label>
                        <input type="text" value={schElig} onChange={e => setSchElig(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-2 rounded" placeholder="10th Board grade average > 90%" required />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-red-650 hover:bg-red-500 text-slate-950 font-extrabold text-xs rounded transition-colors cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950 mx-auto" />
                    ) : (
                      <span>Commit Parameter Record</span>
                    )}
                  </button>

                </form>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
