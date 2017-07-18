# An Open Platform for the Simulation of Java Card Applets

This project was produced as part of a BSc Dissertation and was based on a proof of concept MSc Dissertation by Robin Williams.

This project provides an implementation of a Java Card Runtime Enviornment (JCRE) produced using Node.js which is capable of creating virtual smart card devices and sending APDU commands to the smart card devices for execution via a RESTful API. The project also provides a web-based interface for interacting with the JCRE.

A deployment of the platform is available at https://jcsimulator.herokuapp.com.

## Installation

```bash
$ git clone https://github.com/adamnoakes/javacard-simulator.git
$ cd javacard-simulator
$ npm install
$ npm build
$ npm start
```

Then go to http://localhost:3000 in a web browser.

## Supported Classes

The list of implemented Java Card API classes...

## Tests

This project includes a small number of automate tests using Mocha.js which create smart card devices, install a range of applets on the devices and test the functionality of the applets. A format for creating applet tests is also provided at ...
