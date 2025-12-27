import http from 'k6/http';
import { sleep, check } from 'k6';

// Maximum number of virtual users for the tests
const maxVirtualUsers = 8400; // 8400 should be a little bit below the system's breaking point (found by stress test)
const testDurationInMins = 5; // GitHub runners have strict usage limits

function getTestStageDurations(testDuration, holdStages, rampStages, holdToRampDurationRatio) {
    const hold = testDuration * holdToRampDurationRatio / (holdToRampDurationRatio * holdStages + rampStages);
    const ramp = hold / holdToRampDurationRatio;
    return { hold, ramp };
}

const loadDurationsInMins = getTestStageDurations(testDurationInMins, 1, 2, 10);
const spikeDurationsInMins = getTestStageDurations(testDurationInMins, 2, 6, 10);

// Common thresholds for all test types, in accordance with Non-Functional Requirements
const testingThresholds = {
    http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],  // Error rate < 0.1% (abortOnFail: True stops the execution, once this threshold is violated)
    http_req_duration: [
        { threshold: 'p(95)<500', abortOnFail: true }, // 95% of requests should complete in < 500ms
        { threshold: 'p(99)<1000', abortOnFail: true }, // 99% of requests should complete in < 1000ms
        { threshold: 'max<2000', abortOnFail: true } // Maximum request duration < 2 seconds
    ],
    http_reqs: ['rate>100'] // At least 100 requests per second should be processed
};

// ---------------------------- Load test targeting response time  ----------------------------
// Objective: Test system's behavior for an expected number of users

export const load = {
    stages: [
        { duration: `${loadDurationsInMins.ramp}m`, target: maxVirtualUsers }, //ramp up to maximum number of users
        { duration: `${loadDurationsInMins.hold}m`, target: maxVirtualUsers }, // stable at maximum number of users
        { duration: `${loadDurationsInMins.ramp}m`, target: 0 } // ramp down to 0 users
    ],
    thresholds: testingThresholds
};

// ---------------------------- Endurance/Soak test ----------------------------
// Test system's ability to handle more than average loads for prolonged periods of time

export const soak = {
    stages: [
        { duration: '10m', target: maxVirtualUsers }, // Ramp up to maximum number of users (expected average load of our application)
        { duration: '10h', target: maxVirtualUsers }, // Hold at maximum number of users for 10 hours
        { duration: '10m', target: 0 } // Ramp down to 0 users
    ],
    thresholds: testingThresholds
};

// ---------------------------- Spike test ----------------------------
// Objective: Test the system's ability to handle sudden surges in workload

export const spike = {
    stages: [
        { duration: `${spikeDurationsInMins.ramp}m`, target: maxVirtualUsers/2 }, // Ramp up to from 0 to half of max capacity
        { duration: `${spikeDurationsInMins.ramp}m`, target: maxVirtualUsers/4 }, // Ramp down from half capacity to one fourth
        { duration: `${spikeDurationsInMins.hold}m`, target: maxVirtualUsers/4 }, // Hold at one fourth to stabilize the system
        { duration: `${spikeDurationsInMins.ramp}m`, target: 3*maxVirtualUsers/4 }, // Ramp up from one fourth to three fourths
        { duration: `${spikeDurationsInMins.ramp}m`, target: maxVirtualUsers/4 }, // Ramp down from three fourths to one fourth
        { duration: `${spikeDurationsInMins.hold}m`, target: maxVirtualUsers/4 }, // Hold at one fourth to stabilize the system
        { duration: `${spikeDurationsInMins.ramp}m`, target: maxVirtualUsers }, // Ramp up from one fourth to max capacity
        { duration: `${spikeDurationsInMins.ramp}m`, target: 0 } // Ramp down from max capacity to 0 users
    ],
    thresholds: testingThresholds
};

// ---------------------------- Stress Test ----------------------------
// Objective: Find the system's breaking point

export const stress = {
    scenarios: {
        gradual_ramp: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10m', target: 5000 }, // Ramp up to 5000 users
                { duration: '40m', target: 5000 }, // Hold at 5000 users
                { duration: '10m', target: 10000 }, // Ramp up to 10000 users
                { duration: '40m', target: 10000 }, // Hold at 10000 users
                { duration: '10m', target: 15000 }, // Ramp up to 15000 users
                { duration: '40m', target: 15000 }, // Hold at 15000 users
                { duration: '10m', target: 20000 }, // Ramp up to 20000 users
                { duration: '40m', target: 20000 }, // Hold at 20000 users
                { duration: '10m', target: 0 } // Ramp down to 0 users
            ],
            gracefulRampDown: '10s' // Wait for iterations to complete during ramp down (max 10s), else close the connections forcefully
        }
    },
    thresholds: testingThresholds
};

export function GETandCheckStatus (endpoint) {
    const resp = http.get(endpoint, { responseType: 'none' }); // Disable response body buffering to save memory

    check(resp, { 'Is status 200?': (r) => r.status === 200 });
    check(resp, { 'Is status 2xx?': (r) => Math.floor(r.status/100) === 2 });
    check(resp, { 'Is status 3xx?': (r) => Math.floor(r.status/100) === 3 });
    check(resp, { 'Is status 4xx?': (r) => Math.floor(r.status/100) === 4 });
    check(resp, { 'Is status 5xx?': (r) => Math.floor(r.status/100) === 5 });

    // Simulate realistic user behavior: delay between [0, 5] seconds after each request (applies for each VU independently)
    sleep(Math.random() * 5); // User "think time" between actions
}

