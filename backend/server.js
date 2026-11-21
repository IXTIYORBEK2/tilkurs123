
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

// Server ma'lumotlarini himoyalash
app.disable("x-powered-by");

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// JSON hajmini cheklash
app.use(express.json({ limit: "10kb" }));

// API so'rovlariga limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "So'rovlar limiti tugadi. Keyinroq urinib ko'ring."
    }
});

// Frontend fayllari
app.use(
    express.static(path.join(__dirname, "..", "public"))
);

// Asosiy sahifa
app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "..", "index.html")
    );
});

// Monitoring
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "online",
        service: "MYSQL DEMO API"
    });
});

// API himoyasi
app.use("/api", apiLimiter);

// Notes API
app.use("/api/notes", require("./routes/notes"));

// Noto'g'ri manzillar
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Endpoint topilmadi"
    });
});

// Markazlashtirilgan xatolik boshqaruvi
app.use((err, req, res, next) => {
   console.error("SERVER ERROR:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.status && err.status < 500
            ? err.message
            : "Serverda ichki xatolik yuz berdi"
    });
});

// Serverni ishga tushirish
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("================================");
    console.log("       MYSQL DEMO BACKEND");
    console.log("================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log("Security: ACTIVE");
});
