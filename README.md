
# 3D Plant Facility Simulator

## Overview

Welcome to the 3D Plant Facility Simulator, an interactive application designed to enhance the first-day classroom experience for students embarking on their professional journey. This app is developed in PlayCanvas, allowing students to explore a virtual industrial plant, interact with various components, and gain early exposure to the technical aspects of their future profession.

### Key Features

- **Interactive 3D Environment**: Explore a fully simulated industrial plant with hydraulic pumps, electric motors, an electric cabin, a mixer, and valves.
- **Guided Exploration**: A central mark helps guide users, providing object descriptions and suggesting questions to ask the integrated chatbot.
- **AI-Driven Chatbot**: The chatbot answers technical questions about the plant’s components, helping students understand the industrial environment better.

## Technical Architecture

The application leverages a multi-layered architecture to deliver an engaging and educational experience:

- **PlayCanvas Frontend**: The 3D environment is built using PlayCanvas, offering smooth navigation and interaction for the user.
- **Backend Integration**: Questions posed by users are sent to a Python server hosted on PythonAnywhere via Flask.
- **AI-Powered Responses**: The server processes questions using the Gemini API, which generates embeddings from a knowledge base and stores them in Pinecone vector storage. The questions are then processed using Langchain to fetch and generate the most relevant answers.
- **Continuous Learning**: The chatbot evolves over time as it interacts with users, refining its knowledge base to provide more accurate and helpful responses.

## Educational Impact

This application is specifically designed to assist instructors in introducing students to the industrial environment from day one. By simulating a real-world facility, the app bridges the gap between theoretical knowledge and practical application, making technical content more accessible and engaging.

## Installation

To get started with the 3D Plant Facility Simulator:

1. Clone the repository:
    ```bash
    git clone https://github.com/SamuelOliveira2016/animated-eureka.git
    ```
2. Navigate to the project directory:
    ```bash
    cd 3D-Plant-Facility-Simulator
    ```
3. Follow the instructions in the `setup.md` file to configure your environment.

## Usage

1. Launch the PlayCanvas application.
2. Use the central mark to navigate and explore the facility.
3. Interact with various components by clicking on them to receive descriptions and ask questions.
4. Engage with the chatbot for detailed explanations and technical insights.

## Contribution

We welcome contributions from the community! If you would like to contribute, please fork the repository and submit a pull request. For major changes, please open an issue to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.

## Acknowledgments

- **PlayCanvas** for the interactive 3D environment.
- **PythonAnywhere** for hosting the backend server.
- **Gemini API** for AI-powered embeddings and responses.
- **Langchain** for question processing and answer generation.
- **Pinecone** for vector storage and retrieval.

## Contact

For any inquiries or further information, please contact us at samu.olive14@gmail.com.
