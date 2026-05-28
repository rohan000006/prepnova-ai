const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'database.json');

// Memory cache
let db = {
    users: [],
    sessions: [],
    chat_messages: [],
    notifications: []
};

// Load database from disk
function loadDb() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const rawData = fs.readFileSync(DB_PATH, 'utf8');
            db = JSON.parse(rawData);
        } else {
            seedDb();
        }
    } catch (err) {
        console.error("Error reading database file, using empty db: ", err);
        seedDb();
    }
}

// Save database to disk
function saveDb() {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing database file: ", err);
    }
}

// Seed initial mockup data persistently
function seedDb() {
    console.log("Seeding persistent database.json files...");
    
    // Default user: Alexander Sterling
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("password123", salt);

    const defaultUser = {
        id: "user_sterling_apex",
        name: "Alexander Sterling",
        email: "alex.sterling@vanguard.io",
        passwordHash: passwordHash,
        careerFocus: "Principal Systems Architect & Performance Lead. Mastering Distributed Infrastructure and AI.",
        rating: "98.2",
        hours: "1,284",
        level: "Apex Level 42",
        createdAt: new Date().toISOString()
    };

    db.users = [defaultUser];

    // Default training sessions
    db.sessions = [
        {
            id: "session_architect",
            userId: "user_sterling_apex",
            title: "Senior Distributed Architect",
            topic: "Consistent Hashing & virtual node mapping",
            status: "Completed",
            score: "92",
            progress: "100",
            timestamp: new Date(Date.now() - 3600 * 24 * 3 * 1000).toISOString() // 3 days ago
        },
        {
            id: "session_react",
            userId: "user_sterling_apex",
            title: "Frontend Lead React",
            topic: "Fiber reconciler and layout invalidations",
            status: "In Progress",
            score: "45",
            progress: "45",
            timestamp: new Date(Date.now() - 3600 * 24 * 1 * 1000).toISOString() // 1 day ago
        }
    ];

    // Seed chat history for the sessions
    db.chat_messages = [
        {
            id: "msg_1",
            sessionId: "session_architect",
            sender: "ai",
            text: "Welcome to the consistent hashing simulation. How would you solve key distribution variance across varying physical storage nodes?",
            timestamp: new Date(Date.now() - 3600 * 24 * 3 * 1000).toISOString()
        },
        {
            id: "msg_2",
            sessionId: "session_architect",
            sender: "user",
            text: "I would introduce Virtual Nodes. By hashing each physical node multiple times onto the unit circle, we distribute load evenly and limit hotspot nodes.",
            timestamp: new Date(Date.now() - 3600 * 24 * 3 * 1000 + 60000).toISOString()
        }
    ];

    // Seed notifications
    db.notifications = [
        {
            id: "notify_1",
            userId: "user_sterling_apex",
            type: "psychology",
            title: "AI Analysis Sync completed",
            body: "Nova-1 has compiled distributed storage partition drills feedback. Score achieved: 92%.",
            status: "unread",
            timestamp: new Date(Date.now() - 3600 * 2 * 1000).toISOString() // 2 hours ago
        },
        {
            id: "notify_2",
            userId: "user_sterling_apex",
            type: "schedule",
            title: "Scheduled Calibration Simulation",
            body: "Mock board simulation with AI Lead Agent Sarah commences in 60 minutes.",
            status: "unread",
            timestamp: new Date(Date.now() - 3600 * 4 * 1000).toISOString() // 4 hours ago
        }
    ];

    saveDb();
}

// --- DATABASE OPERATIONS ---

// User functions
const Users = {
    getAll: () => db.users,
    getById: (id) => db.users.find(u => u.id === id),
    getByEmail: (email) => db.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
    create: (name, email, password, careerFocus) => {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        const newUser = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            passwordHash: passwordHash,
            careerFocus: careerFocus || "Professional candidate preparing for technical interviews.",
            rating: "75.0",
            hours: "0",
            level: "Tier 1 Novice",
            createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        saveDb();
        return newUser;
    },
    updateProfile: (userId, name, email, careerFocus) => {
        const user = db.users.find(u => u.id === userId);
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.careerFocus = careerFocus || user.careerFocus;
            saveDb();
            return user;
        }
        return null;
    }
};

// Session functions
const Sessions = {
    getByUser: (userId) => db.sessions.filter(s => s.userId === userId).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)),
    getById: (id) => db.sessions.find(s => s.id === id),
    create: (userId, title, topic) => {
        const newSession = {
            id: 'session_' + Math.random().toString(36).substr(2, 9),
            userId: userId,
            title: title || "AI Simulation Calibration",
            topic: topic || "System Architecture",
            status: "In Progress",
            score: "0",
            progress: "10",
            timestamp: new Date().toISOString()
        };
        db.sessions.push(newSession);
        saveDb();
        return newSession;
    },
    updateProgress: (sessionId, progress, score, status) => {
        const session = db.sessions.find(s => s.id === sessionId);
        if (session) {
            session.progress = progress !== undefined ? progress.toString() : session.progress;
            session.score = score !== undefined ? score.toString() : session.score;
            session.status = status || session.status;
            saveDb();
            return session;
        }
        return null;
    }
};

// Chat logs
const Messages = {
    getBySession: (sessionId) => db.chat_messages.filter(m => m.sessionId === sessionId).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)),
    add: (sessionId, sender, text) => {
        const newMsg = {
            id: 'msg_' + Math.random().toString(36).substr(2, 9),
            sessionId: sessionId,
            sender: sender, // 'user' or 'ai'
            text: text,
            timestamp: new Date().toISOString()
        };
        db.chat_messages.push(newMsg);
        saveDb();
        return newMsg;
    }
};

// Notifications
const Notifications = {
    getByUser: (userId) => db.notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)),
    add: (userId, type, title, body) => {
        const newNotify = {
            id: 'notify_' + Math.random().toString(36).substr(2, 9),
            userId: userId,
            type: type || "info",
            title: title,
            body: body,
            status: "unread",
            timestamp: new Date().toISOString()
        };
        db.notifications.push(newNotify);
        saveDb();
        return newNotify;
    },
    toggleRead: (id) => {
        const notify = db.notifications.find(n => n.id === id);
        if (notify) {
            notify.status = notify.status === 'read' ? 'unread' : 'read';
            saveDb();
            return notify;
        }
        return null;
    }
};

// Initialize DB on require
loadDb();

module.exports = {
    Users,
    Sessions,
    Messages,
    Notifications
};
