import rp from 'request-promise';
import fs from 'fs';
import path from 'path';

export function get(activeWorkspace, hostname, route = '', json = null) {
  return request(activeWorkspace, hostname, route, json, 'GET');
}

export function post(activeWorkspace, hostname, route = '', json = null, multipart = null) {
  return request(activeWorkspace, hostname, route, json, 'POST', multipart);
}

export function put(activeWorkspace, hostname, route = '', json = null) {
  return request(activeWorkspace, hostname, route, json, 'PUT');
}

export function remove(activeWorkspace, hostname, route = '', json = null) {
  return request(activeWorkspace, hostname, route, json, 'DELETE');
}

function request(activeWorkspace, hostname, route, json, method, multipart = null) {
  let options = {
    uri: hostname + route,
    method: method,
    key: fs.readFileSync(path.join(__dirname, '../workspaces', activeWorkspace, '.ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../workspaces', activeWorkspace, '.ssl/crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../ca/ca-crt.pem'))
  };

  if (multipart) {
    options.headers = multipart.getHeaders();
    return multipart.pipe(rp(options));
  }

  return rp(options);
}
