# Esp32Manager

*Read this in other languages: [Français](README.fr.md)*

IOT Project 2020 M1

Each arduino represents a series of sensors.
These arduino parameters will feed a dataset:
temperature,
light.

In order to be able to make predictions, we must first create a dataset, so that our machine learning model can train and make live predictions according to our sensors.
The state of the machine, the evolution of the sensors and the evolution of our predictions will be visible on a website.
If the state of the machine is recognized as broken, a diode will flash on an arduino «mother», to require human intervention on one of the sensors, to fix the problem and therefore, repair the machine.

## Installation

### Backend

You must have Mongodb running on localhost:27017

If this is the first execution, you must run the init_database.js script to create the collections:

```bash
cd back
mongo < init_database.js
```

Then to launch the backend:

```bash
cd back
npm install
npm start
```

### Machine Learning

You must have python 2.7 or higher installed on the machine as well as pip

After the following commands are executed, the machine learning algorithms can be run

```bash
cd machine\ learning
pip install -r requirements.txt
```

### Frontend

```bash
cd front
npm install
npm run serve
```

The frontend will be running on localhost:8080
