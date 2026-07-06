# Exercise Tracker

This is the boilerplate for the Exercise Tracker project. Instructions for building your project can be found at https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/exercise-tracker

## Storage

The API uses SQLite for local persistence. On startup, the app creates `data/exercise-tracker.sqlite` and initializes the required `users` and `exercises` tables if they do not already exist.
