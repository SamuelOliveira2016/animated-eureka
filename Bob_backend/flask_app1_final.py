from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import bob  # Importing bob.py

# Initialize a Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for the Flask app
CORS(app, resources={r"/*": {"origins": "*"}})


# Define a route for the root URL ('/'), accepting only POST requests
@app.route('/', methods=['POST'])
@cross_origin()  # Enable CORS for this specific route
def chat():
    try:
        # Attempt to parse JSON data from the incoming request
        data = request.json

        # Check if the 'text' field is present in the JSON data
        if data and 'text' in data:
            query = data['text']
            # Call a function 'process_query' from the imported 'bob' module
            # and store the response
            response = bob.process_query(query)
            # Prepare the response data as a dictionary
            processed_data = {"response": response}

        else:
            # If 'text' is not in the JSON data, set a default response
            processed_data = {"response": "No query provided"}
        # Return the processed data as JSON
        return jsonify(processed_data)
    except Exception as e:
        # If an exception occurs, print it to the console (useful for debugging)
        print(e)
        # Respond with an error message and a 500 Internal Server Error status
        return jsonify({"Error": str(e)}), 500

# Check if the script is executed directly (not imported)
if __name__ == '__main__':
    # Run the Flask app on port 6000 with debug mode enabled
    # Debug mode provides detailed error pages and live reloading
    app.run(debug=True, port=6000)
