import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import MyPlot from './components/MyPlot';
import Modal from 'react-modal';
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

import SiteFooter from './components/SiteFooter';

const client = generateClient();

const App = ({ signOut }) => {

  Modal.setAppElement('#root');

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDataFile, setSelectedDataFile] = useState('');

  const openModal = (url) => {
    setSelectedDataFile(url); // Now expects a URL
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

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
          const url = await getUrl({ key: note.name });
          note.csvFile = url.url; // Store the URL for the CSV file
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
      csvFile: csvFile.name,
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
    <div className="site-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <View className="App" style={{ flex: '1', textAlign: 'left' }}>
        <Flex direction="row" justifyContent="space-between" alignItems="center" style={{ color: 'white', backgroundColor: "#2f768a", padding: '20px' }}>
          <Heading level={1} style = {{color: 'white'}}>
            EEG Data Visualization Demo
          </Heading>
          <Button onClick={signOut} style={{backgroundColor: 'white'}}>Sign Out</Button>
        </Flex>
        <View as="form" margin="3rem 0" onSubmit={createNote}>
          <Flex direction="column" gap="1rem">
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
            <View as="input" type="file" accept=".csv" name="csvFile" style={{ alignSelf: "start" }} />
            <Button type="submit" variation="primary">
              Upload EEG Record
            </Button>
          </Flex>
        </View>


<Heading level={2} style={{ textAlign: 'left', margin: '1rem' }}>List of EEG Records </Heading>
<View style={{ margin: '3rem 1rem' }}>
  {notes.map((note) => (
    <Flex 
      key={note.id || note.name} 
      direction="row" 
      justifyContent="flex-start" 
      alignItems="center" 
      gap="1rem" 
      style={{ marginBottom: '1rem' }}
    >
      <View style={{ width: '25%', textAlign: 'left', marginLeft: 50 }}>
        <Text as="strong" fontWeight={700}>
          {note.name}
        </Text> 
      </View>
      <View style={{ width: '25%', textAlign: 'left' }}>
        <Text as="span">{note.description}</Text>
      </View>
      <View style={{ width: '25%', textAlign: 'left' }}>
        {note.csvFile && (
          <Button onClick={() => openModal(note.csvFile)} style={{backgroundColor: 'red'}}>View Data</Button>
        )}
      </View>
      <View style={{ width: '25%', textAlign: 'left' }}>
        <Button variation="link" onClick={() => deleteNote(note)}>Delete Record</Button>
      </View>
    </Flex>
  ))}
</View>

          

        <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <Button onClick={closeModal} style={{position: 'absolute', top: '10px', right: '100px', fontSize: '20px'}}>Close</Button>
          <MyPlot dataFile={selectedDataFile} />
          
        </Modal>
      </View>
      <SiteFooter />
    </div>
  );
};

export default withAuthenticator(App);
