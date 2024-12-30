''' 
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: Defines the routes for different html pages of the website
                    Starts data collection for the chart
'''

from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime
import pyrebase
import pytz

app = Flask(__name__)
config = {}
key = 0

@app.route("/")                             # Landing Page
def index():
    return render_template("index.html", js_file='index')

@app.route("/logIn")                       # Log In Page
def logIn():
    return render_template("logIn.html", title = "Log In", js_file='logIn')

@app.route("/signUp")                        # Sign Up Page
def signUp():
    return render_template("signUp.html", title = "Sign Up", js_file='signUp')

@app.route("/home")                         # Account Home Page
def home():
    return render_template("home.html", title = "Home", js_file='home')

@app.route("/instructions")                 # Instructions Page
def instructions():
    return render_template("instructions.html", title = "Instructions", js_file='instructions')

@app.route("/about")                        # About Page
def about():
    return render_template("about.html", title = "About")

global dataCollection
dataCollection = False

@app.route("/startDataCollection", methods=['POST'])
def startDataCollection():
    global dataCollection
    dataCollection = True
    return jsonify({"dataCollection": dataCollection}), 200

@app.route("/stopDataCollection", methods=['POST'])
def stopDataCollection():
    global dataCollection
    dataCollection = False
    return jsonify({"dataCollection": dataCollection}), 200

@app.route("/EMGSensor", methods=['GET', 'POST'])                   # Test Page
def EMGSensor():
    global config, userID, db, current_day, key, dataCollection
    
    # POST request (FB configuration sent from login.js)
    if request.method == 'POST':

        # Get current day to be used as firebase node
        current_day = datetime.now(pytz.timezone('America/New_York')).strftime("%Y-%m-%d")

        config = request.get_json()     # parse as JSON

        # Only pop 'userID' if it exists in config
        if 'userID' in config:
            userID = config.pop('userID')   # userID used for updating data in FRD
            print("User ID" + userID, flush=True)
            print(config, flush=True)

            firebase = pyrebase.initialize_app(config)
            db = firebase.database()

            # Initialize key for new day
            key = 0

        return 'Success', 200
    else:
        if bool(config) == False:
            print("FB config is empty")
        else:
            value = request.args.get('value')
            print("EMG Values: " + value, flush=True)

            if dataCollection:  # Check if data collection is active
                # Get the current time for the key
                current_time = datetime.now(pytz.timezone('America/New_York')).strftime("%H:%M:%S")

                # Update the data under the node for the current day with the current time as the key
                db.child('users/' + userID + '/data/' + current_day).update({current_time: value})

        return "Success"
    
# Run server on local IP address at port 5000
if(__name__ == "__main__"):
    app.run(debug=True, host='127.0.0.1', port=5000)    # Change ip using ipconfig when using sensor
