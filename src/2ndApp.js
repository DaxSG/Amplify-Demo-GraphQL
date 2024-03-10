import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  Button,
  Flex,
  Heading,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';

const client = generateClient();

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.csvFile) {
          const url = await getUrl({ key: note.csvFile.key });
          note.csvFileUrl = url; // Store the URL for the CSV file
        }
        return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const csvFile = form.get("csvFile");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      // Assuming the backend is configured to handle this correctly
      csvFile: csvFile ? { bucket: 'YourS3BucketName', key: `${form.get("name")}.csv`, region: 'YourS3BucketRegion' } : null,
    };
    if (csvFile) await uploadData({
      key: data.name,
      data: csvFile
    });
    await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await remove({ key: name });
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">
      <Heading level={1}>EEG Data Visualization Demo</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Record Date"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Record Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
          <View
            as="input"
            type="file"
            accept=".csv"
            name="csvFile" // Changed from 'image' to 'csvFile'
            style={{ alignSelf: "end" }}
          />
          <Button type="submit" variation="primary">
            Upload EEG Record
          </Button>
        </Flex>
      </View>
      <Heading level={2}>List of EEG Data</Heading>
      <View margin="3rem 0">
        {notes.map((note) => (
          <Flex
            key={note.id || note.name}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Text as="strong" fontWeight={700}>
              {note.name}
            </Text>
            <Text as="span">{note.description}</Text>
            {/* Button for CSV file, replacing the Image component */}
            {note.csvFileUrl && (
              <Button onClick={() => {/* Placeholder for modal trigger */}}>
                View Data
              </Button>
              // Add a comment here where you would implement the functionality for displaying the Plotly plot
              // Implement Plotly plot visualization inside a modal here
            )}
            <Button variation="link" onClick={() => deleteNote(note)}>
              Delete note
            </Button>
          </Flex>
        ))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);
