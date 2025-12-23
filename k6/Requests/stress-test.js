import http from 'k6/http';
import { sleep, check } from 'k6';

// ---------------------------- Stress Test ----------------------------
// Objective: Find the system's breaking point

export const options = {
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
    thresholds: {
        http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],  // Error rate < 0.1% (abortOnFail: True stops the execution, once this threshold is violated)
        http_req_duration: [
            { threshold: 'p(95)<500', abortOnFail: true }, // 95% of requests should complete in < 500ms
            { threshold: 'p(99)<1000', abortOnFail: true }, // 99% of requests should complete in < 1000ms
            { threshold: 'max<2000', abortOnFail: true } // Maximum request duration < 2 seconds
        ],
        http_reqs: ['rate>100'] // At least 100 requests per second should be processed
    }
}

export default () => {
    const resp = http.get('http://localhost:3000/requests');

    check(resp, { 'Is status 200?': (r) => r.status === 200 });
    check(resp, { 'Is status 2xx?': (r) => Math.floor(r.status/100) === 2 });
    check(resp, { 'Is status 3xx?': (r) => Math.floor(r.status/100) === 3 });
    check(resp, { 'Is status 4xx?': (r) => Math.floor(r.status/100) === 4 });
    check(resp, { 'Is status 5xx?': (r) => Math.floor(r.status/100) === 5 });

    // Simulate realistic user behavior: delay between [0, 5] seconds after each request (applies for each VU independently)
    sleep(Math.random() * 5); // User "think time" between actions
}

