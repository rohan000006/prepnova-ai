require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const db = require('./database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'prepnova_secret_key_v4';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve SPA index.html directly from root

// JWT Verification Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access token missing" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Access token invalid or expired" });
        req.user = decoded;
        next();
    });
}

// --- REST API ENDPOINTS ---

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, careerFocus } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password required" });
    }

    const existingUser = db.Users.getByEmail(email);
    if (existingUser) {
        return res.status(409).json({ error: "Candidate identity already exists" });
    }

    const newUser = db.Users.create(name, email, password, careerFocus);
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, careerFocus: newUser.careerFocus } });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    const user = db.Users.getByEmail(email);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordIsValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.Users.getById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Exclude passwordHash in output
    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
});

// Profile endpoints
app.put('/api/profile', authenticateToken, (req, res) => {
    const { name, email, careerFocus } = req.body;
    const updatedUser = db.Users.updateProfile(req.user.id, name, email, careerFocus);

    if (!updatedUser) return res.status(404).json({ error: "User profile not found" });

    const { passwordHash, ...userResponse } = updatedUser;
    res.json(userResponse);
});

// Training sessions
app.get('/api/sessions', authenticateToken, (req, res) => {
    const sessions = db.Sessions.getByUser(req.user.id);
    res.json(sessions);
});

app.post('/api/sessions', authenticateToken, (req, res) => {
    const { title, topic } = req.body;
    const newSession = db.Sessions.create(req.user.id, title, topic);
    res.status(201).json(newSession);
});

app.get('/api/sessions/:id/messages', authenticateToken, (req, res) => {
    const messages = db.Messages.getBySession(req.params.id);
    res.json(messages);
});

// Notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
    const notifies = db.Notifications.getByUser(req.user.id);
    res.json(notifies);
});

app.post('/api/notifications/:id/toggle', authenticateToken, (req, res) => {
    const notify = db.Notifications.toggleRead(req.params.id);
    if (!notify) return res.status(404).json({ error: "Alert not found" });
    res.json(notify);
});

// --- WEBSOCKET REAL-TIME SERVICE ---

// Attach WebSocket upgrade handling
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', (ws) => {
    console.log('Client established WebSocket proxy tunnel.');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Tunnel payload:', data);

            // Handle incoming chat payload
            if (data.type === 'chat_message') {
                const { sessionId, text, userId } = data;

                // Save user message to database
                db.Messages.add(sessionId, 'user', text);

                // Initialize Gemini AI integration
                const apiKey = process.env.GEMINI_API_KEY;
                const isRealGemini = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';

                if (isRealGemini) {
                    try {
                        const genAI = new GoogleGenerativeAI(apiKey);
                        const model = genAI.getGenerativeModel({ 
                            model: "gemini-2.5-flash",
                            systemInstruction: "You are Nova-1, a strict and highly experienced technical mock interviewer for staff/principal software engineering roles. Keep your mock interview replies concise (at most 3-4 sentences). Actively grade and critique the candidate's architecture choices. Discuss tradeoffs."
                        });

                        // Retrieve active session historical messages for context
                        const history = db.Messages.getBySession(sessionId);
                        const chatSession = model.startChat({
                            history: history.slice(0, -1).map(m => ({
                                role: m.sender === 'user' ? 'user' : 'model',
                                parts: [{ text: m.text }]
                            }))
                        });

                        // Stream content from Gemini
                        const result = await chatSession.sendMessageStream(text);
                        let fullAiResponse = "";

                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text();
                            fullAiResponse += chunkText;

                            // Flush chunk token to WebSocket client
                            ws.send(JSON.stringify({
                                type: 'ai_token',
                                sessionId,
                                text: chunkText
                            }));
                        }

                        // Save completed Gemini message persistently
                        db.Messages.add(sessionId, 'ai', fullAiResponse);
                        ws.send(JSON.stringify({ type: 'ai_complete', sessionId }));

                    } catch (aiErr) {
                        console.error("Gemini stream error, engaging fallback simulator: ", aiErr);
                        streamFallbackReply(ws, sessionId, text);
                    }
                } else {
                    // Fall back to high-fidelity mock stream generator
                    streamFallbackReply(ws, sessionId, text);
                }
            }
        } catch (err) {
            console.error("WebSocket server parsing payload error: ", err);
        }
    });

    ws.on('close', () => {
        console.log('Client terminated WebSocket proxy tunnel.');
    });
});

// Fallback high-fidelity streaming AI generator
function streamFallbackReply(ws, sessionId, userText) {
    let replyText = "";
    const lowerText = userText.toLowerCase();

    if (lowerText.includes('consistent hashing') || lowerText.includes('sharding')) {
        replyText = "Alexander, consistent hashing is a solid choice. By mapping physical nodes and keys clockwise on a 32-bit integer circle, it ensures only a minimal fraction of keys migrate during re-sharding. However, you must highlight Virtual Nodes: without hashing each physical server onto multiple virtual locations, your key distribution remains highly uneven, creating latency spikes on hotspots. What are the replication storage trade-offs in this ring model?";
    } else if (lowerText.includes('cap') || lowerText.includes('cap theorem')) {
        replyText = "Your evaluation of CAP parameters is correct. When network partitions occur, CP architectures sacrifice availability to secure strict linearizable consistency, while AP frameworks prioritize fast client feedback over synchronicity. For high-volume transaction architectures, we usually implement AP strategies backed by asynchronous vector-clock resolution. How would you solve dirty write conflicts in that AP scenario?";
    } else if (lowerText.includes('load balancer') || lowerText.includes('round robin')) {
        replyText = "Load balancing policies heavily define edge latency. Simple round-robin fails under capacity variances. I suggest Weighted-Response-Time routing. Furthermore, you must address connection session affinity: using sticky sessions solves cache localization, but risks severe server imbalances if connections are long-lived. How would you distribute session states instead?";
    } else if (lowerText.includes('latency') || lowerText.includes('cache')) {
        replyText = "Layering Redis caches solves reading latencies, but introduces cache invalidation complexities. With high write scales, Cache-Aside combined with Write-Through limits data drift. Have you considered database CDC pipelines? Streaming transaction logs to trigger invalidation events prevents race conditions. How would you handle cache penetration under aggressive query loads?";
    } else {
        replyText = "Your technical description covers the fundamentals. However, L7/L8 review boards expect you to explicitly detail concrete resource constraints. Explain memory, bandwidth, and thread pool exhaustion limits when scaling this infrastructure. Walk me through your diagnostics plan.";
    }

    // Split text into words to simulate streaming ticks
    const words = replyText.split(" ");
    let wordIndex = 0;

    const streamInterval = setInterval(() => {
        if (wordIndex < words.length) {
            const token = words[wordIndex] + " ";
            ws.send(JSON.stringify({
                type: 'ai_token',
                sessionId,
                text: token
            }));
            wordIndex++;
        } else {
            clearInterval(streamInterval);
            db.Messages.add(sessionId, 'ai', replyText);
            ws.send(JSON.stringify({ type: 'ai_complete', sessionId }));
        }
    }, 70); // Stream a word every 70ms for high-end typing dynamics
}

// Serve REST Server
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`PrepNova Full-Stack Server active on http://localhost:${PORT}`);
    console.log(`Secure JWT Tunnel active. Persistent database loaded.`);
    console.log(`====================================================`);
});
