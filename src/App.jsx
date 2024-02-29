import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Split from "react-split";
import "react-mde/lib/styles/css/react-mde-all.css";
import {addDoc, deleteDoc, doc, onSnapshot, setDoc} from 'firebase/firestore';
import { db, notesCollection } from "../firebase";

export default function App() {
    /**
     * * Function is used to initialize first useState call so as to prevent subsequent initialization of state
     * * upon component re-rendering which can be affect performance.
     */

    //* State & State Setter variables
    const [notes, setNotes] = useState([]); 
    const [currentNoteId, setCurrentNoteId] = useState('');

    //* Used for debouncing updates on the currentNote text to the firestore database to minimize read & write cycles
    const [tempNoteText, setTempNoteText] = useState(''); 

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0];
    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);
    
    //* CRUD FUNCTIONS
    async function createNewNote() {
        const newNote = { 
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        const newNoteRef = await addDoc(notesCollection, newNote);
        setCurrentNoteId(newNoteRef.id)
    }
    
    async function updateNote(text) {
        const docRef = doc(db, 'notes', currentNoteId);
        await setDoc(docRef, {body: text, updatedAt: Date.now()}, {merge: true});
    }

    async function deleteNote(noteId){
        const docRef = doc(db,"notes", noteId)
        await deleteDoc(docRef);
    }
    
    //* SIDE EFFECTS
    useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
            // * Sync up our local notes array with the snapshot data
            const notesArray = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
            setNotes(notesArray)
        })
        return unsubscribe;
    }, []);

    useEffect(() => {
        if(!currentNoteId){
            setCurrentNoteId(notes[0]?.id);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notes]);

    useEffect(() => {
        if(currentNote){
            setTempNoteText(currentNote.body);
        }
    }, [currentNote])

    /**
     ** useEffect call to debounce updates to our instance of firestore db notes collection.
     ** tempNoteText is updated on the currentNote doc in the database after every 500ms.
     *
     ** If & when contents of useEffect dependency array changes before 500ms elapses, UI is re-rendered,
     ** timeout is cleared and effect is re-run.

     ** Otherwise if 500ms elapses and afterwards, tempNoteText changes, firestore db is updated, UI is 
     ** re-rendered, timeout is cleared and the effect is re-run.
     */
    useEffect(() => {
        const timeoutId = setTimeout(() =>{
        //Only update to db if tempNote is not equal to cuurentNote.body
            if(tempNoteText !== currentNote.body){
                updateNote(tempNoteText);
            }
            
        }, 500);
        return () => clearTimeout(timeoutId) //Clean up function to clear the timeout b4 next useEffect call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempNoteText])
    
    return (
        <main>
        {
            notes.length > 0 
            ?
            <Split 
                sizes={[30, 70]} 
                direction="horizontal" 
                className="split"
            >
                <Sidebar
                    notes={sortedNotes}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                {
                <Editor 
                    tempNoteText={tempNoteText} 
                    setTempNoteText={setTempNoteText} 
                />
                }
            </Split>
            :
            <div className="no-notes">
                <h1>You have no notes</h1>
                <button 
                    className="first-note" 
                    onClick={createNewNote}
                >
                    Create one now
                </button>
            </div>
            
        }
        </main>
    )
}
