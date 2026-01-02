import { load, GETandCheckStatus } from '../config.js';

// ---------------------------- Load test targeting response time  ----------------------------
// Objective: Test system's behavior for an expected number of users

export const options = load;

export default () => {
    GETandCheckStatus('http://localhost:3000/routes');
}

