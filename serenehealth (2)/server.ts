import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store
type Profile = { 
  id: string; 
  name: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
  medications?: string;
};
let profiles: Profile[] = [];
let currentProfileId = "";

type RecordType = {
  id: string;
  profileId: string;
  title: string;
  date: string;
  clinic: string;
  status: string;
  statusVariant: "normal" | "abnormal" | "warning";
  type: string;
  imageUrl?: string;
  findings: Array<{
    title: string;
    value: string;
    reference: string;
    status: string;
    statusVariant: "normal" | "abnormal";
  }>;
};
let records: RecordType[] = [];

type AppEvent = {
  id: string;
  profileId: string;
  type: string;
  name: string;
  date: string;
  time?: string;
  doctor?: string;
  notes?: string;
  completed: boolean;
};
let events: AppEvent[] = [];

app.get("/api/state", (req, res) => {
  res.json({
    profiles,
    currentProfileId,
    records: records.filter(r => r.profileId === currentProfileId),
    events: events.filter(e => e.profileId === currentProfileId)
  });
});

app.post("/api/state/profile", (req, res) => {
  if (req.body.profileId) {
    currentProfileId = req.body.profileId;
  }
  res.json({ success: true });
});

app.post("/api/state/profile/update", (req, res) => {
  const { bloodGroup, allergies, emergencyContact, medications } = req.body;
  const profile = profiles.find(p => p.id === currentProfileId);
  if (profile) {
    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (allergies !== undefined) profile.allergies = allergies;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (medications !== undefined) profile.medications = medications;
  }
  res.json({ success: true, profile });
});

app.post("/api/state/profile/add", (req, res) => {
  const { name, relationship } = req.body;
  const newProfile = { id: Math.random().toString(36).substring(7), name, relationship };
  profiles.push(newProfile);
  res.json({ success: true, profile: newProfile });
});

app.post("/api/events", (req, res) => {
  const newEvent: AppEvent = {
    id: Math.random().toString(36).substring(7),
    profileId: currentProfileId,
    ...req.body,
    completed: false
  };
  events.push(newEvent);
  res.json({ success: true, event: newEvent });
});

app.put("/api/events/:id", (req, res) => {
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx > -1) {
    events[idx] = { ...events[idx], ...req.body };
    res.json({ success: true, event: events[idx] });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

app.delete("/api/events/:id", (req, res) => {
  events = events.filter(e => e.id !== req.params.id);
  res.json({ success: true });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  
  try {
    const fileBase64 = req.file.buffer.toString("base64");
    
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { data: fileBase64, mimeType: req.file.mimetype } },
          { text: "Extract the details of this medical document. Identify the document title (e.g. Liver Function Test, Prescription), the date, and the clinic/doctor name. Extract the findings, their value, the reference range, and whether the status is 'normal' or 'abnormal'. Summarize the overall status (e.g. '2 findings outside range', 'All within reference range', '3 medications prescribed')." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            clinic: { type: Type.STRING },
            overallStatus: { type: Type.STRING },
            overallStatusVariant: { type: Type.STRING, description: "Must be 'normal', 'abnormal', or 'warning'" },
            docType: { type: Type.STRING },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  value: { type: Type.STRING },
                  reference: { type: Type.STRING },
                  status: { type: Type.STRING },
                  statusVariant: { type: Type.STRING, description: "Must be 'normal' or 'abnormal'" }
                }
              }
            }
          }
        }
      }
    });
    
    const data = JSON.parse(response.text?.trim() || "{}");
    
    const newRecord: RecordType = {
      id: Math.random().toString(36).substring(7),
      profileId: currentProfileId,
      title: data.title || "Medical Record",
      date: data.date || new Date().toISOString().split('T')[0],
      clinic: data.clinic || "Unknown Clinic",
      status: data.overallStatus || "Processed",
      statusVariant: (data.overallStatusVariant === "abnormal" || data.overallStatusVariant === "warning") ? data.overallStatusVariant : "normal",
      type: data.docType || "Report",
      imageUrl: req.file.mimetype.startsWith('image/') ? `data:${req.file.mimetype};base64,${fileBase64}` : undefined,
      findings: data.findings || []
    };
    
    records.push(newRecord);
    
    res.json({ success: true, record: newRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process document" });
  }
});

app.post("/api/auth/signup", (req, res) => {
  const { name } = req.body;
  const newProfile = { id: Math.random().toString(36).substring(7), name: name || "My Profile" };
  profiles = [newProfile];
  currentProfileId = newProfile.id;
  records = [];
  events = [];
  res.json({ success: true, profile: newProfile });
});

app.post("/api/auth/login", (req, res) => {
  // Mock login: if no profiles exist, create a default one
  if (profiles.length === 0) {
    const defaultProfile = { id: Math.random().toString(36).substring(7), name: "My Profile" };
    profiles = [defaultProfile];
    currentProfileId = defaultProfile.id;
  }
  res.json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
