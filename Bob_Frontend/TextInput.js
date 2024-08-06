var TextInput = pc.createScript('textInput');

// Load Firebase SDK
TextInput.prototype.loadFirebaseSDK = function(callback) {
    // Load the Firebase app script
    var firebaseAppScript = document.createElement('script');
    firebaseAppScript.src = "...";
    firebaseAppScript.onload = () => {
        // Load the Firebase database script
        var firebaseDatabaseScript = document.createElement('script');
        firebaseDatabaseScript.src = "...";
        firebaseDatabaseScript.onload = callback;
        document.head.appendChild(firebaseDatabaseScript);
    };
    document.head.appendChild(firebaseAppScript);
};

// Initialize script properties
TextInput.prototype.initialize = function() {
    this.loadFirebaseSDK(() => {
        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "...",
            authDomain: "...",
            databaseURL: "...",
            projectId: "...",
            storageBucket: "...",
            messagingSenderId: "...",
            appId: "...",
            measurementId: "..."
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // URL of the Flask server
        this.flaskUrl = "...";

        // Properties for handling text input
        this.currentText = '';
        this.inputMode = false; // Flag to toggle input modes
        this.userName = ''; // Variable to store user's name
        this.textToSend = ''; // Variable to store the text to send


        // Create chat input and history fields
        this.createChatUI();

        // Initialize speech recognition
        this.initializeSpeechRecognition();

        // Initialize speech synthesis
        this.initializeSpeechSynthesis();
    });
};

TextInput.prototype.createChatUI = function () {
    //Add CSS to arrows
    const style = document.createElement('style');
    style.innerHTML = `
        /* Remove arrows from number input fields */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        input[type="number"] {
            -moz-appearance: textfield; /* For Firefox */
        }
    `;
    document.head.appendChild(style);

    // Create start screen container
    this.startScreenContainer = document.createElement('div');
    this.startScreenContainer.style.position = 'absolute';
    this.startScreenContainer.style.top = '0';
    this.startScreenContainer.style.left = '0';
    this.startScreenContainer.style.width = '100%';
    this.startScreenContainer.style.height = '100%';
    this.startScreenContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.startScreenContainer.style.display = 'flex';
    this.startScreenContainer.style.flexDirection = 'column';
    this.startScreenContainer.style.alignItems = 'center';
    this.startScreenContainer.style.justifyContent = 'center';
    this.startScreenContainer.style.zIndex = '1000';

    // Create form
    this.userForm = document.createElement('form');
    this.userForm.style.backgroundColor = '#fff';
    this.userForm.style.padding = '20px';
    this.userForm.style.borderRadius = '10px';
    this.userForm.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    this.userForm.innerHTML = `
        <h2>Bem-vindo à Planta Industrial 3D</h2>
        <h3>Preencha os dados abaixo para explorar a planta!</h3>
        <label for="name">Nome:</label>
        <input type="text" id="name" name="name" required><br><br>
        <label for="email">Email :</label>
        <input type="email" id="email" name="email"required><br><br>
        <label for="age">Idade:</label>
        <input type="number" id="age" name="age" required><br><br>
        <label for="experienceMechanical">Experiência em Mecânica:</label>
        <select id="experienceMechanical" name="experienceMechanical" required>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
        </select><br><br>
        <label for="experienceElectrical">Experiência em Elétrica:</label>
        <select id="experienceElectrical" name="experienceElectrical" required>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
        </select><br><br>
        <label for="experienceHydraulic">Experiência em Hidráulica:</label>
        <select id="experienceHydraulic" name="experienceHydraulic" required>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
        </select><br><br>
        <button type="submit">Enviar</button>
    `;

    // Append form to start screen container
    this.startScreenContainer.appendChild(this.userForm);

    // Append start screen container to body
    document.body.appendChild(this.startScreenContainer);
    

    // Handle form submission
    this.userForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const age = document.getElementById('age').value;
        const experienceMechanical = document.getElementById('experienceMechanical').value;
        const experienceElectrical = document.getElementById('experienceElectrical').value;
        const experienceHydraulic = document.getElementById('experienceHydraulic').value;

        const userData = {
            name: name,
            email: email,
            age: age,
            experienceMechanical: experienceMechanical,
            experienceElectrical: experienceElectrical,
            experienceHydraulic: experienceHydraulic

        };

        console.log('User Data:', userData);
        // Save to Firebase
        this.saveToFirebase(userData, 'user');
        // Store the user's name
        this.userName = name;

        // Hide start screen and show chat UI
        this.startScreenContainer.style.display = 'none';
        this.chatContainer.style.display = 'flex';
    });

    // Disable character movement when form inputs are focused
    this.userForm.addEventListener('focusin', () => {
        this.app.fire('movement:disable');
    });

    // Re-enable character movement when form inputs lose focus
    this.userForm.addEventListener('focusout', (event) => {
        if (!this.userForm.contains(event.relatedTarget)) {
            this.app.fire('movement:enable');
        }
    });

    // Create chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.style.position = 'absolute';
    this.chatContainer.style.bottom = '10px';
    this.chatContainer.style.right = '10px';
    this.chatContainer.style.zIndex = '1000';
    this.chatContainer.style.display = 'flex';
    this.chatContainer.style.flexDirection = 'column';
    this.chatContainer.style.width = '300px';
    this.chatContainer.style.backgroundImage = 'url("https://play-lh.googleusercontent.com/aFWiT2lTa9CYBpyPjfgfNHd0r5puwKRGj2rHpdPTNrz2N9LXgN_MbLjePd1OTc0E8Rl1=w480-h960-rw")'; // Set background image
    this.chatContainer.style.backgroundSize = 'cover'; 
    this.chatContainer.style.padding = '10px';
    this.chatContainer.style.borderRadius = '10px';
    this.chatContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

    // Create header
    this.header = document.createElement('div');
    this.header.innerText = 'Powered by Gemini';
    this.header.style.fontSize = '16px';
    this.header.style.fontWeight = 'bold';
    this.header.style.color = '#070707';
    this.header.style.marginBottom = '10px';
    this.header.style.textAlign = 'center';

    // Create chat history
    this.chatHistory = document.createElement('div');
    this.chatHistory.style.flex = '1';
    this.chatHistory.style.padding = '5px';
    this.chatHistory.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    this.chatHistory.style.border = '1px solid #ccc';
    this.chatHistory.style.overflowY = 'auto';
    this.chatHistory.style.maxHeight = '300px';
    this.chatHistory.style.marginBottom = '10px';
    this.chatHistory.style.borderRadius = '5px';

    // Create input container
    this.inputContainer = document.createElement('div');
    this.inputContainer.style.display = 'flex';

    // Create input element
    this.chatInput = document.createElement('input');
    this.chatInput.type = 'text';
    this.chatInput.id = 'chatInput';
    this.chatInput.placeholder = 'Digite sua pergunta aqui...';
    this.chatInput.style.flex = '1';
    this.chatInput.style.padding = '5px';
    this.chatInput.style.borderRadius = '5px';

    // Create send button
    this.sendButton = document.createElement('button');
    this.sendButton.innerText = 'Send';
    this.sendButton.style.marginLeft = '5px';
    this.sendButton.style.padding = '5px';
    this.sendButton.style.borderRadius = '5px';

    // Append input and button to input container
    this.inputContainer.appendChild(this.chatInput);
    this.inputContainer.appendChild(this.sendButton);

    // Append header, chat history, and input container to chat container
    this.chatContainer.appendChild(this.header);
    this.chatContainer.appendChild(this.chatHistory);
    this.chatContainer.appendChild(this.inputContainer);

    // Append chat container to body
    document.body.appendChild(this.chatContainer);

    // Event listener to detect focus on chat input
    this.chatInput.addEventListener('focus', () => {
        this.inputMode = true;
        this.app.fire('movement:disable'); // Disable movement
    });

    // Event listener to detect focus out from chat input
    this.chatInput.addEventListener('blur', (event) => {
    // Check if focus is still within the form
    if (!this.chatContainer.contains(event.relatedTarget)) {
        this.inputMode = false;
        this.app.fire('movement:enable'); // Enable movement
    }
    });

    // Handle clicks outside the input field to blur
    document.addEventListener('click', (event) => {
        if (event.target !== this.chatInput && event.target !== this.sendButton) {
            this.chatInput.blur();
        }
    });

    // Handle send button click
    this.sendButton.addEventListener('click', () => {
        this.sendTextToFlask();
        this.chatInput.blur(); // Force blur to re-enable movement

    });

    // Handle keydown event for sending message
    this.chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            this.sendTextToFlask();
            this.chatInput.blur(); // Force blur to re-enable movement
            event.preventDefault(); // Prevent default behavior
        } else if (event.key === 'Escape') {
        this.chatInput.blur(); // Force blur to re-enable movement
        }
    });

    // Append chat container to body but keep it hidden initially
    this.chatContainer.style.display = 'none';
    document.body.appendChild(this.chatContainer);
};

// Save data to Firebase
TextInput.prototype.saveToFirebase = function(data, path) {
    const db = firebase.database();
    const newRef = db.ref(path).push();
    newRef.set(data)
    .then(() => {
        console.log("Data saved to Firebase successfully.");
    })
    .catch((error) => {
        console.error("Error saving data to Firebase: ", error);
    });
};

// Update function called every frame
TextInput.prototype.update = function(dt) {
    // Update the input field with current text
    if (this.inputMode) {
        this.currentText = this.chatInput.value;
    }
};

// Function to send text to Flask server
TextInput.prototype.sendTextToFlask = function() {
    this.textToSend = this.chatInput.value;
    var textToSend = this.textToSend;

    //console.log("Text to send: " + textToSend);
    var jsonObj = { text: textToSend };

    // Add the user's question to the chat history
    this.addMessageToHistory(this.userName, textToSend);

    // Send POST request with text data
    this.postData(jsonObj);

    // Clear input field
    this.currentText = '';
    this.chatInput.value = '';
};

// Function to perform a POST request
TextInput.prototype.postData = function(data) {
    //console.log("Sending POST request with data: " + JSON.stringify(data));

    // Fetch request to Flask server
    fetch(this.flaskUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json(); // Assuming the response is JSON
    })
    .then(data => {
        console.log("Response: ", data["response"]);

        const currentQuestion = this.textToSend;
        // Add the server's response to the chat history
        this.addMessageToHistory('Roberto', data["response"]);

        // Save the conversation (question and answer) to Firebase
        this.saveToFirebase({
            question: currentQuestion,
            answer: data["response"],
            timestamp: new Date().toISOString()
        }, 'conversations');

        // Speak the response
        this.speakResponse(data["response"]);
    })
    .catch(error => {
        console.error("Error:", error);
    });
};

// Function to add a message to the chat history
TextInput.prototype.addMessageToHistory = function(sender, message) {
    var messageElement = document.createElement('div');
    messageElement.style.margin = '5px 0';
    messageElement.innerHTML = '<strong>' + sender + ':</strong> ' + message;
    this.chatHistory.appendChild(messageElement);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight; // Scroll to the bottom
};

// Initialize speech recognition
TextInput.prototype.initializeSpeechRecognition = function() {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech Recognition API is not supported in this browser.");
        return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'pt-BR'; // Set the language

    this.recognition.onresult = (event) => {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                var transcript = event.results[i][0].transcript.trim();
                if (transcript.toLowerCase().includes('roberto')) {
                    this.handleVoiceCommand(transcript);
                }
            }
        }
    };

    this.recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            console.warn("No speech detected, continuing...");
            return;
        }
        console.error("Speech recognition error: ", event.error);
    };

    this.recognition.onend = () => {
        //console.log("Speech recognition ended, restarting...");
        this.recognition.start(); // Restart recognition
    };

    this.recognition.start();
};

// Handle voice commands
TextInput.prototype.handleVoiceCommand = function(transcript) {
    if (transcript.toLowerCase().includes('roberto')) {
        this.addMessageToHistory(this.userName, transcript);
        this.textToSend = transcript;
        var jsonObj = { text: transcript };

        // Send POST request with text data
        this.postData(jsonObj);
    }
};

// Initialize speech synthesis
TextInput.prototype.initializeSpeechSynthesis = function() {
    var speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) {
        console.warn("Speech Synthesis API is not supported in this browser.");
        return;
    }

    this.voices = [];

    var populateVoiceList = () => {
        this.voices = speechSynthesis.getVoices();

        // Selected a specific voice
        this.selectedVoice = this.voices.find(voice => voice.name.includes('Eddy (português (Brasil))') && voice.lang === 'pt-BR');
    };

    populateVoiceList();

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
};

// Speak the response
TextInput.prototype.speakResponse = function(text) {
    var speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) {
        console.warn("Speech Synthesis API is not supported in this browser.");
        return;
    }

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; 
    if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
    }
    speechSynthesis.speak(utterance);
};

// Start the script
pc.registerScript(TextInput);
