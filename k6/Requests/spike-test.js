import http from 'k6/http';
import { sleep, check } from 'k6';

// ---------------------------- Spike test ----------------------------
// Objective: Test the system's ability to handle sudden surges in workload

export const options = {
    stages: [
        { duration: '2m', target: 4200 }, // Ramp up to from 0 to 4200 users
        { duration: '2m', target: 2100 }, // Ramp down from 4200 to 2100 users
        { duration: '20m', target: 2100 }, // Hold at 2100 users to stabilize the system
        { duration: '2m', target: 6300 }, // Ramp up from 2100 to 6300 users
        { duration: '2m', target: 2100 }, // Ramp down from 6300 to 2100 users
        { duration: '20m', target: 2100 }, // Hold at 2100 users to stabilize the system
        { duration: '2m', target: 8400 }, // Ramp up from 2100 to 8400 users
        { duration: '2m', target: 0 } // Ramp down from 8400 to 0 users
        // 8400 should be a little bit below the system's breaking point (found by stress test), so we stop here
    ],
    thresholds: {
        http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],  // Error rate < 0.1% (abortOnFail: True stops the execution, once this threshold is violated)
        http_req_duration: [
            { threshold: 'p(95)<500', abortOnFail: true }, // 95% of requests should complete in < 500ms
            { threshold: 'p(99)<1000', abortOnFail: true }, // 99% of requests should complete in < 1000ms
            { threshold: 'max<2000', abortOnFail: true } // Maximum request duration < 2 seconds
        ],
        http_reqs: ['rate>100'] // At least 100 requests per second should be processed
    }
};

export default () => {
    const resp = http.get('http://localhost:3000/requests');

    check(resp, { 'Is status 200?': (r) => r.status === 200 });
    check(resp, { 'Is status 2xx?': (r) => Math.floor(r.status/100) === 2 });
    check(resp, { 'Is status 3xx?': (r) => Math.floor(r.status/100) === 3 });
    check(resp, { 'Is status 4xx?': (r) => Math.floor(r.status/100) === 4 });
    check(resp, { 'Is status 5xx?': (r) => Math.floor(r.status/100) === 5 });

    // Simulate realistic user behavior: delay between [0, 5] seconds after each request (applies for each VU independently)
    sleep(Math.random() * 5); // User "think time" between actions
};

