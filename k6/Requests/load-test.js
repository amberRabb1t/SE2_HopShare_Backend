import http from 'k6/http';
import { sleep, check } from 'k6';


// ---------------------------- Load test targeting response time  ----------------------------
// Objective: Test system's behavior for an expected number of users

export const options = {
    stages: [
        { duration: '10m', target: 8400 }, //ramp up to 8400 users
        { duration: '100m', target: 8400 }, // stable at 8400 users
        { duration: '10m', target: 0 } // ramp down to 0 users        
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

