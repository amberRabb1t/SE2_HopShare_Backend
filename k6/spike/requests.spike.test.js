import { spike, GETandCheckStatus } from '../config.js';

// ---------------------------- Spike test ----------------------------
// Objective: Test the system's ability to handle sudden surges in workload

export const options = spike;

export default () => {
    GETandCheckStatus('http://localhost:3000/requests');
};

