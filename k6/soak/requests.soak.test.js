import { soak, GETandCheckStatus } from '../config.js';

// ---------------------------- Endurance/Soak test ----------------------------
// Test system's ability to handle more than average loads for prolonged periods of time

export const options = soak;

export default () => {
    GETandCheckStatus('http://localhost:3000/requests');
};

