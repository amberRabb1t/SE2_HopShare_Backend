import morgan from 'morgan';

/*
    HTTP request logger middleware using morgan,
    configured to use the 'combined' predefined format: 
    provides detailed information about each request,
    including remote address, request method, URL, HTTP version,
    response status, user agent, and more.
*/

export const httpLogger = morgan('combined');

