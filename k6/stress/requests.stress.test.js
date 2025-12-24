import { stress, GETandCheckStatus } from '../config.js';

// ---------------------------- Stress Test ----------------------------
// Objective: Find the system's breaking point

export const options = stress;

export default () => {
    GETandCheckStatus('http://localhost:3000/requests');
}

