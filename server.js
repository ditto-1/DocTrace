const express = require('express');
const multer = require("multer");
const pdfParse = require("pdf-parse");
const db = require("./database");
const fs = require("fs");
const app = express();
const upload = multer({dest: "uploads/"});
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "DocTrace API"
    });
});

app.post("/api/documents", upload.single("document"), async (req, res)=>{
    try {
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);

        const insert = db.prepare(`
            INSERT INTO documents (filename, pages, text)
            VALUES(?, ?, ?)
        `);

        const result = insert.run(
            req.file.originalname,
            pdfData.numpages,
            pdfData.text
        );

        res.status(201).json({
            message: "Document uploaded successfully",
            documentId: result.lastInsertRowid,
            filename: req.file.originalname,
            pages: pdfData.total,
        });
    } catch(error) {
        console.log("PDF processing error: ", error);
        res.status(500).json({
            message: "Failed to process pdf",
            error: error.message
        });
    }
});

app.get("/api/documents", (req, res)=>{
    try {
        const documents = db
            .prepare(`
                SELECT id, filename, pages, uploaded_at
                FROM documents
                ORDER BY uploaded_at DESC
                `)
            .all();
        res.json({
            documents: documents
        });
    } catch(error){
        console.error("Database error: ", error);
        res.status(500).json({
            message: "Failed to extract document"
        });
    }
});

app.get("/api/documents/:id", (req, res) => {
    try{
        const document = db
            .prepare(`
                    SELECT id, filename, pages, text, uploaded_at
                    FROM documents
                    WHERE id = ?
                `)
            .get(req.params.id);
        
            if (!document){
                return res.status(404).json({
                    message: "Document not found"
                });
            }

            res.json(document);
    } catch(error){
        console.error("Database error: ", error);
        res.status(500).json({
            message: "Failed to retrieve document"
        });
    }
});



app.listen(PORT, () => {
    console.log(`DocTrace server running on http://localhost:${PORT}`);
});