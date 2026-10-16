const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGODB_URI || !ADMIN_USERNAME || !ADMIN_PASSWORD || !SESSION_SECRET) {
  console.error("Missing required environment variables. Check your .env file.");
  process.exit(1);
}

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "3mb" }));
app.use(session({
  name: "cybertech.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI, collectionName: "sessions" }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ["course", "service", "material"], required: true },
  name: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, maxlength: 3000 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0, min: 0 },
  tutor: { type: String, default: "", maxlength: 100 },
  category: { type: String, default: "", maxlength: 80 },
  duration: { type: String, default: "", maxlength: 150 },
  image: { type: String, default: "", maxlength: 2200000 },
  published: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
const Product = mongoose.model("Product", productSchema);

const siteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "main" },
  announcementEnabled: { type: Boolean, default: true },
  announcementText: { type: String, default: "✨ Special offers are live — explore CyberTech deals today!" },
  announcementEnd: { type: String, default: "" },
  popupEnabled: { type: Boolean, default: false },
  popupTitle: { type: String, default: "A special offer for you!" },
  popupText: { type: String, default: "Explore our latest courses, digital services, and test preparation material." },
  popupImage: { type: String, default: "" },
  popupButtonText: { type: String, default: "Explore offers" },
  popupButtonUrl: { type: String, default: "#marketplace" },
  updatedAt: { type: Date, default: Date.now }
}, { versionKey: false });
const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
const DEFAULT_SITE_SETTINGS = {
  key: "main", announcementEnabled: true,
  announcementText: "✨ Special offers are live — explore CyberTech deals today!",
  announcementEnd: "", popupEnabled: false, popupTitle: "A special offer for you!",
  popupText: "Explore our latest courses, digital services, and test preparation material.",
  popupImage: "", popupButtonText: "Explore offers", popupButtonUrl: "#marketplace"
};


const seedProducts = [
  {
    "id": "c1",
    "type": "course",
    "name": "Sigma X — AI Full Stack Web Development",
    "tutor": "Apna College",
    "description": "A structured path through modern web development, projects, and practical coding.",
    "price": 999,
    "originalPrice": 1999,
    "category": "Web Development",
    "duration": "Lifetime access",
    "image": "",
    "published": true,
    "featured": true
  },
  {
    "id": "c2",
    "type": "course",
    "name": "Prime AI/ML",
    "tutor": "Apna College",
    "description": "Explore artificial intelligence and machine learning concepts with guided lessons.",
    "price": 999,
    "originalPrice": 1499,
    "category": "AI & Machine Learning",
    "duration": "Lifetime access",
    "image": "",
    "published": true,
    "featured": true
  },
  {
    "id": "c3",
    "type": "course",
    "name": "DSA with Java — Alpha 3.0",
    "tutor": "Apna College",
    "description": "Build problem-solving skills with data structures, algorithms, and practice.",
    "price": 499,
    "originalPrice": 999,
    "category": "Programming",
    "duration": "Lifetime access",
    "image": "",
    "published": true,
    "featured": false
  },
  {
    "id": "c4",
    "type": "course",
    "name": "Delta — Full Stack Web Development",
    "tutor": "Apna College",
    "description": "Learn frontend and backend foundations and strengthen your project portfolio.",
    "price": 499,
    "originalPrice": 999,
    "category": "Web Development",
    "duration": "Lifetime access",
    "image": "",
    "published": true,
    "featured": false
  },
  {
    "id": "s1",
    "type": "service",
    "name": "Google Gemini Pro — 18 Months",
    "tutor": "",
    "description": "AI-powered assistance for research, productivity, creativity, and learning. Confirm plan features and eligibility before ordering.",
    "price": 500,
    "originalPrice": 1500,
    "category": "AI Subscription",
    "duration": "18 months (offer details subject to confirmation)",
    "image": "",
    "published": true,
    "featured": true
  },
  {
    "id": "s2",
    "type": "service",
    "name": "Portfolio Website Creation",
    "tutor": "",
    "description": "A polished personal portfolio to showcase your skills, projects, and contact information.",
    "price": 2500,
    "originalPrice": 3500,
    "category": "Web Development",
    "duration": "Custom scope",
    "image": "",
    "published": true,
    "featured": true
  },
  {
    "id": "s3",
    "type": "service",
    "name": "Business Website Development",
    "tutor": "",
    "description": "Responsive website design for your brand, business, or personal project. Final quote depends on requirements.",
    "price": 5000,
    "originalPrice": 7000,
    "category": "Web Development",
    "duration": "Custom scope",
    "image": "",
    "published": true,
    "featured": false
  },
  {
    "id": "s4",
    "type": "service",
    "name": "Google AI & Productivity Guidance",
    "tutor": "",
    "description": "Get help exploring AI tools and productivity workflows for study and everyday work.",
    "price": 500,
    "originalPrice": 0,
    "category": "Digital Services",
    "duration": "Ask for details",
    "image": "",
    "published": true,
    "featured": false
  },
  {
    "id": "m1",
    "type": "material",
    "name": "STHP Preparation Material",
    "tutor": "",
    "description": "Preparation resource collection for the STHP test. Confirm included topics and format before ordering.",
    "price": 300,
    "originalPrice": 500,
    "category": "Entry Test",
    "duration": "Digital material",
    "image": "",
    "published": true,
    "featured": true
  },
  {
    "id": "m2",
    "type": "material",
    "name": "NTHP Preparation Material",
    "tutor": "",
    "description": "Study resources to support NTHP preparation, revision, and practice.",
    "price": 300,
    "originalPrice": 500,
    "category": "Entry Test",
    "duration": "Digital material",
    "image": "",
    "published": true,
    "featured": true
  },
  {
    "id": "m3",
    "type": "material",
    "name": "Entry Test MCQs & Practice Tests",
    "tutor": "",
    "description": "Practice questions to help you revise core concepts and improve test readiness.",
    "price": 200,
    "originalPrice": 0,
    "category": "MCQs & Practice",
    "duration": "Digital material",
    "image": "",
    "published": true,
    "featured": false
  },
  {
    "id": "m4",
    "type": "material",
    "name": "Past Papers & Solved Papers",
    "tutor": "",
    "description": "Past-paper practice resources. Ask us about the available exams, subjects, and editions.",
    "price": 250,
    "originalPrice": 0,
    "category": "Past Papers",
    "duration": "Digital material",
    "image": "",
    "published": true,
    "featured": false
  }
];

function requireAdmin(req, res, next) {
  if (!req.session || req.session.isAdmin !== true) {
    return res.status(401).json({ error: "Please log in to the admin panel." });
  }
  next();
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." }
});

app.post("/api/admin/login", loginLimiter, (req, res, next) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string" ||
      username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  req.session.regenerate(err => {
    if (err) return next(err);
    req.session.isAdmin = true;
    req.session.save(err2 => {
      if (err2) return next(err2);
      res.json({ ok: true });
    });
  });
});

app.post("/api/admin/logout", (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie("cybertech.sid", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    res.json({ ok: true });
  });
});


app.get("/api/site-settings", async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne({ key: "main" }).lean();
    res.json({ settings: { ...DEFAULT_SITE_SETTINGS, ...(settings || {}) } });
  } catch (err) { next(err); }
});

app.get("/api/admin/site-settings", requireAdmin, async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne({ key: "main" }).lean();
    res.json({ settings: { ...DEFAULT_SITE_SETTINGS, ...(settings || {}) } });
  } catch (err) { next(err); }
});

app.put("/api/admin/site-settings", requireAdmin, async (req, res, next) => {
  try {
    const b = req.body || {};
    const clean = {
      key: "main",
      announcementEnabled: Boolean(b.announcementEnabled),
      announcementText: String(b.announcementText || "").slice(0, 240),
      announcementEnd: String(b.announcementEnd || "").slice(0, 40),
      popupEnabled: Boolean(b.popupEnabled),
      popupTitle: String(b.popupTitle || "").slice(0, 140),
      popupText: String(b.popupText || "").slice(0, 1200),
      popupImage: String(b.popupImage || "").slice(0, 2200000),
      popupButtonText: String(b.popupButtonText || "Explore offers").slice(0, 60),
      popupButtonUrl: String(b.popupButtonUrl || "#marketplace").slice(0, 500),
      updatedAt: new Date()
    };
    await SiteSettings.findOneAndUpdate({ key: "main" }, { $set: clean }, { upsert: true, new: true, runValidators: true });
    res.json({ ok: true, settings: clean });
  } catch (err) { next(err); }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const products = await Product.find({ published: true }).sort({ createdAt: 1 }).lean();
    res.json({ products });
  } catch (err) { next(err); }
});

app.get("/api/admin/products", requireAdmin, async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 }).lean();
    res.json({ products });
  } catch (err) { next(err); }
});

// The existing single-file admin UI sends its complete edited product list here.
app.put("/api/admin/products/bulk", requireAdmin, async (req, res, next) => {
  try {
    const products = req.body && req.body.products;
    if (!Array.isArray(products) || products.length > 500) {
      return res.status(400).json({ error: "Invalid product list." });
    }
    const seen = new Set();
    for (const p of products) {
      if (!p || typeof p.id !== "string" || !p.id || seen.has(p.id) ||
          !["course", "service", "material"].includes(p.type) ||
          typeof p.name !== "string" || !p.name.trim() ||
          typeof p.description !== "string" ||
          !Number.isFinite(Number(p.price)) || Number(p.price) < 0 ||
          (p.image && (typeof p.image !== "string" || p.image.length > 2200000))) {
        return res.status(400).json({ error: "A product has invalid or oversized fields." });
      }
      seen.add(p.id);
    }
    await Product.deleteMany({});
    if (products.length) {
      await Product.insertMany(products.map(p => ({
        id: p.id, type: p.type, name: p.name.trim(), description: p.description,
        price: Number(p.price), originalPrice: Number(p.originalPrice) || 0,
        tutor: p.tutor || "", category: p.category || "", duration: p.duration || "",
        image: p.image || "", published: Boolean(p.published), featured: Boolean(p.featured)
      })), { ordered: true });
    }
    res.json({ ok: true, count: products.length });
  } catch (err) { next(err); }
});

app.use(express.static(path.join(__dirname, "public")));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Server error. Please try again." });
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  await SiteSettings.updateOne({ key: "main" }, { $setOnInsert: DEFAULT_SITE_SETTINGS }, { upsert: true });
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(seedProducts);
    console.log(`Inserted ${seedProducts.length} starter products into MongoDB.`);
  }
  app.listen(PORT, () => console.log(`CyberTech is running on port ${PORT}`));
}
start().catch(err => {
  console.error("Could not connect to MongoDB:", err.message);
  process.exit(1);
});
