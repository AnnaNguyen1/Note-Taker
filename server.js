const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const {
  readFromFile,
  readAndAppend,
  writeToFile,
} = require("./helpers/fsUtils");

const app = express();
const PORT = process.env.PORT || 3002;

// app.use("/api", api);
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("/api/notes", (req, res) => {
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

app.get("/:id", (req, res) => {
  const noteId = req.params.id;
  readFromFile("./db/db.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      const result = json.filter((note) => note.id === noteId);
      return result.length > 0
        ? res.json(result)
        : res.json("No note with that ID");
    });
});

app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  if (!req.body) {
    res.error("Error in adding note");
    return;
  }

  const newNote = {
    ...req.body,
    id: uuidv4(),
  };

  readAndAppend(newNote, "./db/db.json");
  res.json(`Note added successfully`);
});

app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  readFromFile("./db/db.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      const result = json.filter((json) => json.id !== noteId);

      writeToFile("./db/db.json", result);

      res.json(`Item ${noteId} has been deleted`);
    });
});

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
