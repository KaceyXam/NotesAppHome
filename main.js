import { db } from "./firebase";
import { setDoc, query, collection, doc, deleteDoc } from "firebase/firestore";
import { collectionData } from "rxfire/firestore";
import { startWith } from "rxjs";
import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
} from "firebase/auth";

const auth = getAuth();
const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");
addNoteButton.addEventListener("click", () => {
	addNote();
});
const myForm = document.getElementById("myForm");
const myDialog = document.getElementById("myDialog");
const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", () => {
	signingOut();
});
myForm.addEventListener("click", (event) => event.stopPropagation());
loginButton.addEventListener("click", () => {
	eraseText();
	signInForm.classList.remove("hide");
	signUpForm.classList.add("hide");
	myDialog.showModal();
});
myDialog.addEventListener("click", () => myDialog.close());
const cancelButtons = document.querySelectorAll("#cancel1, #cancel2");
cancelButtons.forEach((button) => {
	button.addEventListener("click", () => {
		myDialog.close();
	});
});
const signInTrigger = document.getElementById("signup-btn");
signInTrigger.addEventListener("click", () => {
	signUpForm.classList.remove("hide");
	signInForm.classList.add("hide");
});
const signUpTrigger = document.getElementById("signin-btn");
signUpTrigger.addEventListener("click", () => {
	signUpForm.classList.add("hide");
	signInForm.classList.remove("hide");
});
var x = document.getElementById("snackbar");
let collectData;
let user;
let uid;
let notes = [];
const signInForm = document.getElementById("signin");
signInForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const email = signInForm.querySelector("#email");
	const password = signInForm.querySelector("#password");
	signIn(email.value, password.value);
});
const signUpForm = document.getElementById("signup");
signUpForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const email = signUpForm.querySelector("input[type='email']");
	const password = signUpForm.querySelector("input[type='password']");
	signUp(email.value, password.value);
});

function eraseText() {
	document.getElementById("signup").reset();
	document.getElementById("signin").reset();
}

function signIn(email, password) {
	signInWithEmailAndPassword(auth, email, password)
		.catch((error) => {
			alert(error);
		})
		.then((result) => {
			user = result.user;
			uid = user.uid;
			myDialog.close();
			addNoteButton.classList.remove("hide");
			loginButton.classList.add("hide");
			logoutButton.classList.remove("hide");
			showSignin(email);
			getNotes();
		});
}

function signUp(email, password) {
	createUserWithEmailAndPassword(auth, email, password)
		.catch((error) => {
			alert(error);
		})
		.then((result) => {
			user = result.user;
			uid = user.uid;
			myDialog.close();
			addNoteButton.classList.remove("hide");
			loginButton.classList.add("hide");
			logoutButton.classList.remove("hide");
			showSignup(email);
			getNotes();
		});
}

function showSignin(email) {
	x.innerText = `You've signed in as ${email}.`;
	x.className = "show";
	setTimeout(function () {
		x.className = x.className.replace("show", "");
	}, 3000);
}

function showSignup(email) {
	x.innerText = `You've signed up as ${email}.`;
	x.className = "show";
	setTimeout(function () {
		x.className = x.className.replace("show", "");
	}, 3000);
}

function signingOut() {
	signOut(auth)
		.then(() => {
			loginButton.classList.remove("hide");
			logoutButton.classList.add("hide");
			addNoteButton.classList.add("hide");
			uid = undefined;
			derender();
		})
		.catch((error) => {
			console.log(error);
		});
}

function getNotes() {
	const queryData = query(collection(db, `users/${uid}/savednotes`));
	collectData = collectionData(queryData, { idField: "id" })
		.pipe(startWith([]))
		.subscribe((data) => {
			notes = data;
			rerender();
		});
}

function pushData(id, content) {
	setDoc(doc(db, `users/${uid}/savednotes`, id), { content });
}

function saveNotes(notes) {
	notes.forEach((note) => {
		pushData(note.id, note.content);
	});
}

function createNoteElement(id, content) {
	const wrapper = document.createElement("div");
	const element = document.createElement("textarea");
	const deleteButton = document.createElement("button");

	wrapper.classList.add("note-wrapper");

	wrapper.append(element, deleteButton);

	deleteButton.classList.add("delete");
	deleteButton.innerText = "Delete";
	deleteButton.addEventListener("click", () => {
		deleteNote(id, wrapper);
	});

	element.classList.add("note");
	element.value = content;
	element.placeholder = "Empty Sticky Note";

	element.addEventListener("change", () => {
		updateNote(id, element.value);
	});

	return wrapper;
}

function addNote() {
	const noteObject = {
		id: Date.now().toString(),
		content: "",
	};

	const noteElement = createNoteElement(noteObject.id, noteObject.content);
	notesContainer.insertBefore(noteElement, addNoteButton);

	notes.push(noteObject);
	saveNotes(notes);
}

function updateNote(id, newContent) {
	const targetNote = notes.filter((note) => note.id === id)[0];
	console.log(targetNote);

	targetNote.content = newContent;
	saveNotes(notes);
}

function deleteNote(id, element) {
	const tempNotes = notes.filter((note) => note.id != id);
	saveNotes(tempNotes);
	notesContainer.removeChild(element);

	deleteDoc(doc(db, `users/${uid}/savednotes`, id));
}

function rerender() {
	const noteElems = document.querySelectorAll(".note-wrapper");
	noteElems.forEach((elem) => {
		elem.remove();
	});

	notes.forEach((elem) => {
		const element = createNoteElement(elem.id, elem.content);
		notesContainer.insertBefore(element, addNoteButton);
	});
}

function derender() {
	console.log("Derendering...");
	const noteElems = document.querySelectorAll(".note-wrapper");
	noteElems.forEach((elem) => {
		elem.remove();
	});
	collectData.unsubscribe();
}
